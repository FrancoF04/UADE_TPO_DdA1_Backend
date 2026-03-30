const { Router } = require('express');
const { success, error } = require('../utils/response');
const { authenticate } = require('../middleware/auth');
const { findUserById, users } = require('../data/data');

const router = Router();

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
