const { Router } = require('express');
const { success, error } = require('../utils/response');
const { authenticate } = require('../middleware/auth');
const {
  users,
  addUserActivity,
  getUserActivities,
  findUserById,
  getDynamicActivityById,
} = require('../data/data');

const router = Router();

const normalizeDateString = (value) => {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString();
};

const sanitizeUser = (user) => {
  const { password: _password, ...sanitized } = user;
  if (!Array.isArray(sanitized.activities)) {
    sanitized.activities = [];
  }
  return sanitized;
};

const mapToReservationResponse = (selection) => {
  const activity = getDynamicActivityById(selection.activityId);

  return {
    activityId: selection.activityId,
    activityName: typeof activity?.name === 'string' ? activity.name : '',
    selectedDate: selection.selectedDate,
    selectedScheduleId: selection.selectedScheduleId || null,
    quantity: Number.isInteger(selection.quantity) && selection.quantity > 0 ? selection.quantity : 1,
    cancellationHours: Number.isFinite(selection.cancellationHours) ? selection.cancellationHours : 0,
    status: typeof selection.status === 'string' ? selection.status : 'active',
  };
};

router.get('/me', authenticate, (req, res) => {
  const userId = req.auth?.userId || req.user?.id;
  const user = findUserById(userId);

  if (!user) {
    return error(res, 'Usuario no encontrado', 404);
  }

  return success(res, { user: sanitizeUser(user) });
});

router.get('/activities', authenticate, (req, res) => {
  const rawActivities = getUserActivities(req.user.id) || [];

  const detailedActivities = rawActivities.map(mapToReservationResponse);

  return success(res, { detailedActivities });
});

router.post('/activities', authenticate, (req, res) => {
  const { activityId, selectedDate, selectedScheduleId, quantity } = req.body;

  if (!activityId || typeof activityId !== 'string') {
    return error(res, 'activityId es requerido', 400);
  }

  if (
    (!selectedDate || typeof selectedDate !== 'string')
    && (!selectedScheduleId || typeof selectedScheduleId !== 'string')
  ) {
    return error(res, 'selectedDate o selectedScheduleId es requerido', 400);
  }

  const validQuantity = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;

  const activity = getDynamicActivityById(activityId);

  if (!activity) {
    return error(res, 'Actividad no encontrada', 404);
  }

  const schedules = Array.isArray(activity.schedules) ? activity.schedules : [];
  let resolvedDate = normalizeDateString(selectedDate);
  let resolvedScheduleId = typeof selectedScheduleId === 'string' ? selectedScheduleId : null;

  if (resolvedScheduleId) {
    const schedule = schedules.find((item) => item.id === resolvedScheduleId);
    if (!schedule) {
      return error(res, 'selectedScheduleId no disponible para la actividad', 400);
    }
    resolvedDate = normalizeDateString(schedule.date);
  }

  const availableDates = (activity.dates || []).map(normalizeDateString);

  if (!resolvedDate || !availableDates.includes(resolvedDate)) {
    return error(res, 'selectedDate no disponible para la actividad', 400);
  }

  if (!resolvedScheduleId) {
    const matchingSchedule = schedules.find((item) => item.date === resolvedDate);
    resolvedScheduleId = matchingSchedule?.id || null;
  }

  const targetSchedule = schedules.find(
    (item) => item.id === resolvedScheduleId || normalizeDateString(item.date) === resolvedDate,
  );

  if (!targetSchedule || targetSchedule.availableSpots < validQuantity) {
    return error(res, 'No hay cupos disponibles para la fecha seleccionada', 409);
  }

  const activitySelection = addUserActivity(
    req.user.id,
    activityId,
    resolvedDate,
    resolvedScheduleId,
    validQuantity,
  );

  if (!activitySelection) {
    return error(res, 'No hay cupos disponibles para la fecha seleccionada', 409);
  }

  const rawActivities = getUserActivities(req.user.id) || [];

  const detailedActivities = rawActivities.map(mapToReservationResponse);

  return success(
    res,
    { detailedActivities },
    null,
    201,
  );
});

router.put('/preferences', authenticate, (req, res) => {
  const { categories, destinations } = req.body;
  if (!categories || !destinations) {
    return error(res, 'Categories y destinations son requeridos', 400);
  }
  if (!Array.isArray(categories) || !Array.isArray(destinations)) {
    return error(res, 'Categories y destinations deben ser arrays', 400);
  }
  const userIndex = users.findIndex((u) => u.id === req.user.id);
  if (userIndex === -1) {
    return error(res, 'Usuario no encontrado', 404);
  }
  users[userIndex] = {
    ...users[userIndex],
    preferences: { categories, destinations },
  };
  const { password: _password, ...sanitized } = users[userIndex];
  return success(res, { user: sanitized });
});

module.exports = router;
