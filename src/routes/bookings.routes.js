const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const { getPagination, paginate } = require('../utils/pagination');
const { pollUntil } = require('../utils/longPoll');
const { serializeBooking, serializeActivity } = require('../utils/activityView');
const {
  addUserActivity,
  cancelUserActivity,
  getUserBookings,
  getBookingById,
  getDynamicActivityById,
  getOfflineBundleForUser,
  getSyncChangesSince,
} = require('../data/data');

const router = Router();

const normalizeDateTime = (dateValue, timeValue) => {
  if (!dateValue) {
    return null;
  }

  if (typeof dateValue === 'string' && dateValue.includes('T')) {
    const parsed = new Date(dateValue);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  if (!timeValue) {
    const parsed = new Date(dateValue);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  const normalizedTime =
    /[zZ]$/.test(timeValue) || /[+-]\d\d:\d\d$/.test(timeValue)
      ? timeValue
      : `${timeValue.length === 5 ? `${timeValue}:00` : timeValue}Z`;
  const parsed = new Date(`${dateValue}T${normalizedTime}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const parseParticipants = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

const getCurrentUserBookings = (req) => getUserBookings(req.user.id) || [];

const findLatestBooking = (bookings, activityId, selectedDate, selectedScheduleId) => {
  return [...bookings]
    .filter((booking) => {
      if (booking.activityId !== activityId) {
        return false;
      }

      if (selectedDate && booking.selectedDate !== selectedDate) {
        return false;
      }

      if (selectedScheduleId && booking.selectedScheduleId !== selectedScheduleId) {
        return false;
      }

      return booking.status !== 'cancelled';
    })
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0];
};

const serializeBookingWithActivity = (booking) => {
  const activity = getDynamicActivityById(booking.activityId);
  return serializeBooking(booking, activity);
};

router.post('/', authenticate, (req, res) => {
  const {
    activity_id,
    activityId,
    fecha,
    date,
    horario,
    time,
    selectedDate,
    selectedScheduleId,
    quantity,
    participants,
  } = req.body;

  const resolvedActivityId = activityId || activity_id;
  if (!resolvedActivityId || typeof resolvedActivityId !== 'string') {
    return error(res, 'activity_id es requerido', 400);
  }

  const resolvedParticipants = parseParticipants(quantity ?? participants);
  const scheduleId = typeof selectedScheduleId === 'string' ? selectedScheduleId : null;
  const dateCandidate = selectedDate || date || fecha || null;
  const timeCandidate = time || horario || null;
  const resolvedDate = scheduleId ? null : normalizeDateTime(dateCandidate, timeCandidate);

  if (!scheduleId && !resolvedDate) {
    return error(res, 'fecha o selectedScheduleId es requerido', 400);
  }

  const activity = getDynamicActivityById(resolvedActivityId);
  if (!activity) {
    return error(res, 'Actividad no encontrada', 404);
  }

  const bookingSelection = addUserActivity(
    req.user.id,
    resolvedActivityId,
    resolvedDate || dateCandidate,
    scheduleId,
    resolvedParticipants,
  );

  if (!bookingSelection) {
    return error(res, 'No hay cupos disponibles para la fecha seleccionada', 409);
  }

  const currentBookings = getCurrentUserBookings(req);
  const booking = findLatestBooking(
    currentBookings,
    resolvedActivityId,
    resolvedDate ? new Date(resolvedDate).toISOString() : normalizeDateTime(dateCandidate, timeCandidate),
    scheduleId,
  );

  if (!booking) {
    return error(res, 'No se pudo recuperar la reserva creada', 500);
  }

  return success(res, { booking: serializeBookingWithActivity(booking) }, null, 201);
});

router.get('/', authenticate, (req, res) => {
  const pagination = getPagination(req.query, 10, 100);
  const bookings = getCurrentUserBookings(req)
    .map(serializeBookingWithActivity)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  return success(res, paginate(bookings, pagination), {
    total: bookings.length,
    page: pagination.page,
    page_size: pagination.pageSize,
    limit: pagination.limit,
  });
});

router.get('/offline-bundle', authenticate, (req, res) => {
  const bundle = getOfflineBundleForUser(req.user.id) || [];
  const confirmedBookings = bundle.map(({ booking, activity }) => serializeBooking(booking, activity));

  return success(res, {
    bookings: confirmedBookings,
    vouchers: confirmedBookings.map((booking) => ({
      bookingId: booking.id,
      voucherCode: booking.voucherCode,
    })),
    activities: confirmedBookings
      .map((booking) => booking.activity)
      .filter(Boolean)
      .map((activity) => serializeActivity(activity)),
    meetingPoints: confirmedBookings.map((booking) => ({
      bookingId: booking.id,
      activityId: booking.activityId,
      meetingPoint: booking.meetingPoint,
    })),
  });
});

router.post('/sync', authenticate, (req, res) => {
  const { since, timestamp, localState } = req.body;
  const changes = getSyncChangesSince(since || timestamp || req.query.since || req.query.timestamp);

  return success(res, {
    since: since || timestamp || req.query.since || req.query.timestamp || null,
    serverTime: new Date().toISOString(),
    localState: localState || null,
    changes,
  });
});

// Clon de /sync como Long Polling real (Feature 12.30 — avisos de cancelación/reprogramación)
router.get('/sync/poll', authenticate, (req, res) => {
  const since = req.query.since || null;

  pollUntil(req, res, () => {
    const changes = getSyncChangesSince(since);
    return changes.length > 0 ? { since, serverTime: new Date().toISOString(), changes } : null;
  });
});

router.get('/:id', authenticate, (req, res) => {
  const booking = getBookingById(req.params.id);
  if (!booking || booking.userId !== req.user.id) {
    return error(res, 'Reserva no encontrada', 404);
  }

  return success(res, { booking: serializeBookingWithActivity(booking) });
});

const cancelBooking = (req, res) => {
  const booking = getBookingById(req.params.id);
  if (!booking || booking.userId !== req.user.id) {
    return error(res, 'Reserva no encontrada', 404);
  }

  const cancellation = cancelUserActivity(
    req.user.id,
    booking.activityId,
    booking.selectedScheduleId,
    booking.selectedDate,
    booking.id,
  );

  if (!cancellation) {
    return error(res, 'Reserva no encontrada', 404);
  }

  if (cancellation.blocked) {
    return error(res, 'No se puede cancelar dentro del plazo permitido', 409);
  }

  const activity = getDynamicActivityById(booking.activityId);
  return success(res, {
    message: 'Reserva cancelada',
    cancellationPolicy: booking.cancellationPolicy || activity?.cancellationPolicy || null,
  });
};

router.delete('/:id', authenticate, cancelBooking);
router.post('/:id/cancel', authenticate, cancelBooking);

module.exports = router;