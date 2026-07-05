const { Router } = require('express');
const { success, error } = require('../utils/response');
const { operatorCancelBooking, operatorRescheduleBooking } = require('../data/data');

const router = Router();

// Sin auth a propósito: herramienta de simulación/testing para la Feature 12.30, no un rol real.
router.post('/bookings/:id/cancel', (req, res) => {
  const booking = operatorCancelBooking(req.params.id);
  if (!booking) {
    return error(res, 'Reserva no encontrada o no cancelable', 404);
  }
  return success(res, { booking });
});

router.post('/bookings/:id/reschedule', (req, res) => {
  const { selectedScheduleId } = req.body;
  if (!selectedScheduleId) {
    return error(res, 'selectedScheduleId es requerido', 400);
  }

  const booking = operatorRescheduleBooking(req.params.id, selectedScheduleId);
  if (!booking) {
    return error(res, 'Reserva no encontrada o schedule inválido', 404);
  }
  return success(res, { booking });
});

module.exports = router;
