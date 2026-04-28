const { Router } = require('express');
const { getActivitiesWithDynamicAvailability, getDynamicActivityById } = require('../data/data');
const { success, error } = require('../utils/response');
const { authenticate } = require('../middleware/auth');

const router = Router();

const serializeActivity = (activity) => activity;

router.get('/featured', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 5;
  const featured = getActivitiesWithDynamicAvailability()
    .filter((a) => a.featured === true)
    .slice(0, limit)
    .map(serializeActivity);
  return success(res, featured);
});

router.get('/recommended', authenticate, (req, res) => {
  const { categories = [], destinations = [] } = req.user.preferences || {};
  const recommended = getActivitiesWithDynamicAvailability().filter(
    (a) => categories.includes(a.category) || destinations.includes(a.destination),
  );
  return success(res, recommended.map(serializeActivity));
});

router.get('/filters', (_req, res) => {
  const activityList = getActivitiesWithDynamicAvailability();
  const destinations = [...new Set(activityList.map((a) => a.destination))];
  const categories = [...new Set(activityList.map((a) => a.category))];
  const dates = [...new Set(activityList.flatMap((a) => a.dates || []))];
  return success(res, { destinations, categories, dates });
});

router.get('/:id', (req, res) => {
  const activity = getDynamicActivityById(req.params.id);
  if (!activity) {
    return error(res, 'Actividad no encontrada', 404);
  }
  return success(res, serializeActivity(activity));
});

router.get('/', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
  const { destination, category, date, priceMin, priceMax } = req.query;

  let filtered = getActivitiesWithDynamicAvailability();

  if (destination) {
    filtered = filtered.filter((a) => a.destination === destination);
  }
  if (category) {
    filtered = filtered.filter((a) => a.category === category);
  }
  if (date) {
    filtered = filtered.filter((a) => (a.dates || []).some((activityDate) => activityDate.startsWith(date)));
  }
  if (priceMin !== undefined) {
    filtered = filtered.filter((a) => a.price >= parseFloat(priceMin));
  }
  if (priceMax !== undefined) {
    filtered = filtered.filter((a) => a.price <= parseFloat(priceMax));
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit).map(serializeActivity);

  return success(res, paginated, { total, page, limit });
});

module.exports = router;
