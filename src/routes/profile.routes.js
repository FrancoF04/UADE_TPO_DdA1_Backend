const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const { users, findUserById, getBookingsSummaryForUser } = require('../data/data');

const router = Router();

const sanitizeProfile = (user) => ({
  id: user.id,
  name: user.fullName || '',
  fullName: user.fullName || '',
  email: user.email || '',
  phone: user.phoneNumber || '',
  phoneNumber: user.phoneNumber || '',
  profilePhotoUrl: user.profilePhotoUrl || user.photoUrl || '',
  photoUrl: user.profilePhotoUrl || user.photoUrl || '',
  preferences: user.preferences || { categories: [], destinations: [] },
});

const findCurrentUser = (req) => findUserById(req.auth?.userId || req.user?.id);

router.get(['/', '/me'], authenticate, (req, res) => {
  const user = findCurrentUser(req);

  if (!user) {
    return error(res, 'Usuario no encontrado', 404);
  }

  return success(res, { user: sanitizeProfile(user) });
});

router.patch(['/', '/me'], authenticate, (req, res) => {
  const userIndex = users.findIndex((item) => item.id === (req.auth?.userId || req.user?.id));
  if (userIndex === -1) {
    return error(res, 'Usuario no encontrado', 404);
  }

  const { name, fullName, phone, phoneNumber, photoUrl, profilePhotoUrl } = req.body;
  if (!name && !fullName && !phone && !phoneNumber && !photoUrl && !profilePhotoUrl) {
    return error(res, 'No se enviaron campos para actualizar', 400);
  }

  const updatedUser = { ...users[userIndex] };

  if (typeof name === 'string' && name.trim()) {
    updatedUser.fullName = name.trim();
  }

  if (typeof fullName === 'string' && fullName.trim()) {
    updatedUser.fullName = fullName.trim();
  }

  if (typeof phone === 'string' && phone.trim()) {
    updatedUser.phoneNumber = phone.trim();
  }

  if (typeof phoneNumber === 'string' && phoneNumber.trim()) {
    updatedUser.phoneNumber = phoneNumber.trim();
  }

  if (typeof photoUrl === 'string' && photoUrl.trim()) {
    updatedUser.profilePhotoUrl = photoUrl.trim();
  }

  if (typeof profilePhotoUrl === 'string' && profilePhotoUrl.trim()) {
    updatedUser.profilePhotoUrl = profilePhotoUrl.trim();
  }

  users[userIndex] = updatedUser;

  return success(res, { user: sanitizeProfile(updatedUser) });
});

router.get('/preferences', authenticate, (req, res) => {
  const user = findCurrentUser(req);
  if (!user) {
    return error(res, 'Usuario no encontrado', 404);
  }

  return success(res, {
    preferences: user.preferences || { categories: [], destinations: [] },
  });
});

router.put('/preferences', authenticate, (req, res) => {
  const { categories } = req.body;
  if (!Array.isArray(categories)) {
    return error(res, 'Categories debe ser un array', 400);
  }

  const userIndex = users.findIndex((item) => item.id === (req.auth?.userId || req.user?.id));
  if (userIndex === -1) {
    return error(res, 'Usuario no encontrado', 404);
  }

  const currentPreferences = users[userIndex].preferences || { categories: [], destinations: [] };
  users[userIndex] = {
    ...users[userIndex],
    preferences: {
      ...currentPreferences,
      categories,
    },
  };

  return success(res, {
    user: sanitizeProfile(users[userIndex]),
  });
});

router.get('/bookings-summary', authenticate, (req, res) => {
  const user = findCurrentUser(req);
  if (!user) {
    return error(res, 'Usuario no encontrado', 404);
  }

  const summary = getBookingsSummaryForUser(user.id);

  return success(res, {
    summary: {
      totalBookings: summary.total,
      confirmedBookings: summary.confirmed,
      cancelledBookings: summary.cancelled,
      finalizedBookings: summary.finalized,
      upcomingBookings: summary.upcoming,
      completedBookings: summary.completed,
      totalSpent: summary.totalSpent,
      byStatus: summary.byStatus,
    },
  });
});

module.exports = router;