const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const { getPagination, paginate } = require('../utils/pagination');
const { serializeActivity } = require('../utils/activityView');
const {
  getActivitiesWithDynamicAvailability,
  getDynamicActivityById,
  getActivityHistoryForUser,
  getRatingsByUser,
  getBookingById,
  findSessionByToken,
  findUserById,
  updateActivityImage,
} = require('../data/data');
const { uploadActivityImage } = require('../utils/upload');

const router = Router();

const getOptionalAuthenticatedUser = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const session = findSessionByToken(token);
  if (!session || new Date(session.expiresAt) < new Date()) {
    return null;
  }

  return findUserById(session.userId);
};

router.get('/featured', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 5;
  const featured = getActivitiesWithDynamicAvailability()
    .filter((activity) => activity.featured === true)
    .slice(0, limit)
    .map((activity) => serializeActivity(activity));

  return success(res, featured);
});

router.get('/recommended', authenticate, (req, res) => {
  const { categories = [], destinations = [] } = req.user.preferences || {};
  const recommended = getActivitiesWithDynamicAvailability().filter(
    (activity) => categories.includes(activity.category) || destinations.includes(activity.destination),
  );

  return success(res, recommended.map((activity) => serializeActivity(activity)));
});

router.get('/filters', (_req, res) => {
  const activityList = getActivitiesWithDynamicAvailability();
  const destinations = [...new Set(activityList.map((activity) => activity.destination))];
  const categories = [...new Set(activityList.map((activity) => activity.category))];
  const dates = [...new Set(activityList.flatMap((activity) => activity.dates || []))];

  return success(res, { destinations, categories, dates });
});

router.get('/history', authenticate, (req, res) => {
  const pagination = getPagination(req.query, 10, 100);
  const { fecha_desde, fecha_hasta, destination } = req.query;

  let history = getActivityHistoryForUser(req.user.id) || [];

  if (fecha_desde) {
    const from = new Date(fecha_desde);
    if (!Number.isNaN(from.getTime())) {
      history = history.filter((item) => new Date(item.date).getTime() >= from.getTime());
    }
  }

  if (fecha_hasta) {
    const to = new Date(fecha_hasta);
    if (!Number.isNaN(to.getTime())) {
      history = history.filter((item) => new Date(item.date).getTime() <= to.getTime());
    }
  }

  if (destination) {
    history = history.filter((item) => item.destination === destination);
  }

  return success(res, paginate(history, pagination), {
    total: history.length,
    page: pagination.page,
    page_size: pagination.pageSize,
    limit: pagination.limit,
  });
});

router.get('/:id', (req, res) => {
  const activity = getDynamicActivityById(req.params.id);
  if (!activity) {
    return error(res, 'Actividad no encontrada', 404);
  }

  const user = getOptionalAuthenticatedUser(req);
  let userRating = null;

  if (user) {
    const rating = getRatingsByUser(user.id).find((item) => {
      const booking = getBookingById(item.bookingId);
      return booking?.activityId === activity.id;
    });

    if (rating) {
      userRating = {
        bookingId: rating.bookingId,
        activityRating: rating.activityRating,
        guideRating: rating.guideRating,
        comment: rating.comment,
        createdAt: rating.createdAt,
      };
    }
  }

  return success(res, serializeActivity(activity, { userRating }));
});

router.get('/', (req, res) => {
  const pagination = getPagination(req.query, 10, 100);
  const { destination, category, date, priceMin, priceMax } = req.query;

  let filtered = getActivitiesWithDynamicAvailability();

  if (destination) {
    filtered = filtered.filter((activity) => activity.destination === destination);
  }

  if (category) {
    filtered = filtered.filter((activity) => activity.category === category);
  }

  if (date) {
    filtered = filtered.filter((activity) =>
      (activity.dates || []).some((activityDate) => activityDate.startsWith(date)),
    );
  }

  if (priceMin !== undefined) {
    filtered = filtered.filter((activity) => activity.price >= parseFloat(priceMin));
  }

  if (priceMax !== undefined) {
    filtered = filtered.filter((activity) => activity.price <= parseFloat(priceMax));
  }

  const total = filtered.length;
  const paginated = paginate(filtered, pagination).map((activity) => serializeActivity(activity));

  return success(res, paginated, {
    total,
    page: pagination.page,
    page_size: pagination.pageSize,
    limit: pagination.limit,
  });
});

// POST /api/activities/:id/image — upload or replace the main image of an activity
router.post('/:id/image', authenticate, (req, res) => {
  const activity = getDynamicActivityById(req.params.id);
  if (!activity) {
    return error(res, 'Actividad no encontrada', 404);
  }

  uploadActivityImage(req, res, (err) => {
    if (err) {
      const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      return error(res, err.message, status);
    }

    if (!req.file) {
      return error(res, 'No se envio ninguna imagen. Usa el campo "image" en el formulario.', 400);
    }

    const imageUrl = `/uploads/activities/${req.file.filename}`;
    const updated = updateActivityImage(req.params.id, imageUrl);

    return success(res, { activity: serializeActivity(updated), imageUrl });
  });
});

module.exports = router;