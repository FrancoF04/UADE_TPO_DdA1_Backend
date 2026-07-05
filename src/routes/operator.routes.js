const { Router } = require('express');
const { success, error } = require('../utils/response');
const { operatorCancelSchedule, operatorRescheduleSchedule } = require('../data/data');

const router = Router();

// Sin auth a propósito: herramienta de simulación/testing para la Feature 12.30, no un rol real.
router.post('/activities/:activityId/schedules/:scheduleId/cancel', (req, res) => {
  const affectedBookings = operatorCancelSchedule(req.params.activityId, req.params.scheduleId);
  if (affectedBookings === null) {
    return error(res, 'Actividad no encontrada', 404);
  }
  return success(res, { affectedBookings });
});

router.post('/activities/:activityId/schedules/:scheduleId/reschedule', (req, res) => {
  const { toScheduleId } = req.body;
  if (!toScheduleId) {
    return error(res, 'toScheduleId es requerido', 400);
  }

  const affectedBookings = operatorRescheduleSchedule(req.params.activityId, req.params.scheduleId, toScheduleId);
  if (affectedBookings === null) {
    return error(res, 'Actividad o schedule destino no encontrado', 404);
  }
  return success(res, { affectedBookings });
});

module.exports = router;
