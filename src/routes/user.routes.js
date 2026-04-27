const { Router } = require('express');
const { success, error } = require('../utils/response');
const { authenticate } = require('../middleware/auth');
const { users, addUserActivity, getUserActivities, findUserById } = require('../data/data');

const router = Router();

const sanitizeUser = (user) => {
  const { password: _password, ...sanitized } = user;
  if (!Array.isArray(sanitized.activities)) {
    sanitized.activities = [];
  }
  return sanitized;
};

router.get('/me', authenticate, (req, res) => {
  const userId = req.auth?.userId || req.user?.id;
  const user = findUserById(userId);

  if (!user) {
    return error(res, 'Usuario no encontrado', 404);
  }

  return success(res, { user: sanitizeUser(user) });
});

router.put('/me', authenticate, (req, res) => {
  const { username, email, phoneNumber, fullName } = req.body;
  const userId = req.auth?.userId || req.user?.id;

  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    return error(res, 'Usuario no encontrado', 404);
  }

  // Actualizar solo los campos proporcionados
  if (username) users[userIndex].username = username;
  if (email) users[userIndex].email = email;
  if (phoneNumber) users[userIndex].phoneNumber = phoneNumber;
  if (fullName) users[userIndex].fullName = fullName;

  return success(res, { user: sanitizeUser(users[userIndex]) });
});

router.get('/activities', authenticate, (req, res) => {
  const activities = getUserActivities(req.user.id) || [];
  return success(res, { activities });
});

router.post('/activities', authenticate, (req, res) => {
  const { activityId } = req.body;

  if (!activityId || typeof activityId !== 'string') {
    return error(res, 'activityId es requerido', 400);
  }

  const activity = addUserActivity(req.user.id, activityId);

  if (!activity) {
    return error(res, 'Actividad no encontrada', 404);
  }

  return success(res, { activityId: activity, activities: getUserActivities(req.user.id) || [] }, null, 201);
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
