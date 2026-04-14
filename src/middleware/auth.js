const { findSessionByToken, findUserById } = require('../data/data');
const { decodeToken } = require('../utils/token');
const { error } = require('../utils/response');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Token de autenticacion requerido', 401);
  }
  const token = authHeader.split(' ')[1];
  const session = findSessionByToken(token);
  if (!session) {
    return error(res, 'Token invalido o expirado', 401);
  }
  if (new Date(session.expiresAt) < new Date()) {
    return error(res, 'Sesion expirada', 401);
  }
  const tokenPayload = decodeToken(token);
  const userId = tokenPayload?.userId || session.userId;
  const user = findUserById(userId);
  if (!user) {
    return error(res, 'Usuario no encontrado', 401);
  }
  req.auth = tokenPayload;
  req.user = user;
  req.session = session;
  next();
};

module.exports = { authenticate };
