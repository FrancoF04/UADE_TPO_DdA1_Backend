const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const { addRating, getRatingByBooking, getBookingById } = require('../data/data');

const router = Router();

const MAX_COMMENT_LENGTH = 300;
const RATING_WINDOW_MS = 48 * 60 * 60 * 1000;

const parseScore = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 5 ? parsed : null;
};

const isWithinRatingWindow = (booking) => {
  const bookingDate = new Date(booking.selectedDate);
  if (Number.isNaN(bookingDate.getTime())) {
    return false;
  }

  return Date.now() - bookingDate.getTime() <= RATING_WINDOW_MS;
};

router.post('/', authenticate, (req, res) => {
  const { booking_id, bookingId, activity_rating, activityRating, guide_rating, guideRating, comment } = req.body;
  const resolvedBookingId = bookingId || booking_id;
  const resolvedActivityRating = parseScore(activityRating ?? activity_rating);
  const resolvedGuideRating = parseScore(guideRating ?? guide_rating);
  const resolvedComment = typeof comment === 'string' ? comment.trim() : '';

  if (!resolvedBookingId || typeof resolvedBookingId !== 'string') {
    return error(res, 'booking_id es requerido', 400);
  }

  if (!resolvedActivityRating || !resolvedGuideRating) {
    return error(res, 'Las puntuaciones deben estar entre 1 y 5', 400);
  }

  if (resolvedComment.length > MAX_COMMENT_LENGTH) {
    return error(res, 'El comentario no puede superar 300 caracteres', 400);
  }

  const booking = getBookingById(resolvedBookingId);
  if (!booking || booking.userId !== req.user.id) {
    return error(res, 'Reserva no encontrada', 404);
  }

  if (booking.status !== 'finalized' && new Date(booking.selectedDate).getTime() > Date.now()) {
    return error(res, 'La actividad aun no finalizo', 409);
  }

  if (!isWithinRatingWindow(booking)) {
    return error(res, 'La calificacion debe enviarse dentro de las 48 horas posteriores a la finalizacion', 409);
  }

  if (getRatingByBooking(resolvedBookingId)) {
    return error(res, 'La reserva ya fue calificada', 409);
  }

  const rating = addRating({
    id: `r${Date.now()}`,
    bookingId: resolvedBookingId,
    userId: req.user.id,
    activityRating: resolvedActivityRating,
    guideRating: resolvedGuideRating,
    comment: resolvedComment || null,
    createdAt: new Date().toISOString(),
  });

  if (!rating) {
    return error(res, 'La reserva ya fue calificada', 409);
  }

  return success(res, { rating }, null, 201);
});

router.get('/:bookingId', authenticate, (req, res) => {
  const rating = getRatingByBooking(req.params.bookingId);

  if (!rating || rating.userId !== req.user.id) {
    return error(res, 'Calificacion no encontrada', 404);
  }

  return success(res, { rating });
});

module.exports = router;