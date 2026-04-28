const { Router } = require('express');
const bcrypt = require('bcryptjs');
const {
  findUserByEmail,
  findUserByUsername,
  findUserById,
  addUser,
  addOtp,
  addSession,
  removeSession,
  invalidateOtpsForEmail,
  sessions,
  otpCodes,
} = require('../data/data');
const { success, error } = require('../utils/response');
const {
  isValidEmail,
  isValidOtp,
  isValidUsername,
  isValidPassword,
  isValidPhoneNumber,
} = require('../utils/validation');
const { generateOtp, isOtpExpired } = require('../utils/otp');
const { generateToken } = require('../utils/token');
const { authenticate } = require('../middleware/auth');

const router = Router();

const getSessionTtlMs = () => {
  const minutes = parseInt(process.env.SESSION_TTL_MINUTES || '60', 10);
  return Math.max(5, minutes) * 60 * 1000;
};

const getRefreshTtlMs = () => {
  const days = parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || '7', 10);
  return Math.max(1, days) * 24 * 60 * 60 * 1000;
};

const issueSession = (user) => {
  const accessExpiresAt = new Date(Date.now() + getSessionTtlMs()).toISOString();
  const refreshExpiresAt = new Date(Date.now() + getRefreshTtlMs()).toISOString();
  const token = generateToken({ userId: user.id, fullName: user.fullName, type: 'access', expiresAt: accessExpiresAt });
  const refreshToken = generateToken({
    userId: user.id,
    fullName: user.fullName,
    type: 'refresh',
    expiresAt: refreshExpiresAt,
  });

  addSession({
    token,
    refreshToken,
    userId: user.id,
    expiresAt: accessExpiresAt,
    refreshExpiresAt,
  });

  return { token, refreshToken, expiresAt: accessExpiresAt, refreshExpiresAt };
};

const extractBearerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.split(' ')[1];
};

router.post('/otp/request', (req, res) => {
  const { email } = req.body;
  if (!email || !isValidEmail(email)) {
    return error(res, 'Email invalido', 400);
  }
  const code = generateOtp();
  const otp = {
    email,
    code,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    used: false,
  };
  addOtp(otp);
  console.log(`[OTP] Codigo para ${email}: ${code}`);
  return success(res, { message: 'Codigo OTP enviado' });
});

router.post('/otp/verify', (req, res) => {
  const { email, code } = req.body;
  if (!email || !isValidEmail(email)) {
    return error(res, 'Email invalido', 400);
  }
  if (!code || !isValidOtp(code)) {
    return error(res, 'Codigo OTP invalido', 400);
  }
  const otp = otpCodes.find((o) => o.email === email && o.code === code && !o.used);
  if (!otp) {
    return error(res, 'Codigo OTP incorrecto', 400);
  }
  if (isOtpExpired(otp)) {
    return error(res, 'Codigo OTP expirado', 400);
  }
  otp.used = true;
  let user = findUserByEmail(email);
  if (!user) {
    user = addUser({
      id: `u${Date.now()}`,
      email,
      username: email.split('@')[0],
      password: '',
      fullName: '',
      phoneNumber: '',
      activities: [],
      preferences: { categories: [], destinations: [] },
      createdAt: new Date().toISOString(),
    });
  }
  const session = issueSession(user);
  return success(res, {
    token: session.token,
    accessToken: session.token,
    refreshToken: session.refreshToken,
  });
});

router.post('/otp/resend', (req, res) => {
  const { email } = req.body;
  if (!email || !isValidEmail(email)) {
    return error(res, 'Email invalido', 400);
  }
  invalidateOtpsForEmail(email);
  const code = generateOtp();
  const otp = {
    email,
    code,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    used: false,
  };
  addOtp(otp);
  console.log(`[OTP] Codigo reenviado para ${email}: ${code}`);
  return success(res, { message: 'Codigo OTP reenviado' });
});

router.post('/register', async (req, res) => {
  const { email, username, password, fullName, phoneNumber } = req.body;
  if (!email || !username || !password || !fullName || !phoneNumber) {
    return error(res, 'Todos los campos son requeridos', 400);
  }
  if (!isValidEmail(email)) {
    return error(res, 'Email invalido', 400);
  }
  if (!isValidUsername(username)) {
    return error(res, 'Username invalido (3-20 caracteres alfanumericos)', 400);
  }
  if (!isValidPassword(password)) {
    return error(res, 'La contrasena debe tener al menos 6 caracteres', 400);
  }
  if (!isValidPhoneNumber(phoneNumber)) {
    return error(res, 'Numero de telefono invalido', 400);
  }
  if (findUserByEmail(email)) {
    return error(res, 'El email ya esta registrado', 409);
  }
  if (findUserByUsername(username)) {
    return error(res, 'El username ya esta en uso', 409);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = addUser({
    id: `u${Date.now()}`,
    email,
    username,
    password: hashedPassword,
    fullName,
    phoneNumber,
    activities: [],
    preferences: { categories: [], destinations: [] },
    createdAt: new Date().toISOString(),
  });
  const session = issueSession(user);
  return success(
    res,
    {
      token: session.token,
      accessToken: session.token,
      refreshToken: session.refreshToken,
    },
    null,
    201,
  );
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return error(res, 'Username y contrasena son requeridos', 400);
  }
  const user = findUserByUsername(username);
  if (!user) {
    return error(res, 'Credenciales invalidas', 401);
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return error(res, 'Credenciales invalidas', 401);
  }
  const session = issueSession(user);
  return success(res, {
    token: session.token,
    accessToken: session.token,
    refreshToken: session.refreshToken,
  });
});

router.post('/refresh', (req, res) => {
  const refreshToken = req.body.refreshToken || extractBearerToken(req);
  if (!refreshToken) {
    return error(res, 'Refresh token requerido', 400);
  }

  const session = sessions.find((item) => item.refreshToken === refreshToken || item.token === refreshToken);
  if (!session) {
    return error(res, 'Token invalido o expirado', 401);
  }

  if (session.refreshExpiresAt && new Date(session.refreshExpiresAt) < new Date()) {
    return error(res, 'Sesion expirada', 401);
  }

  const user = findUserById(session.userId);
  if (!user) {
    return error(res, 'Usuario no encontrado', 401);
  }

  removeSession(session.token);
  const refreshedSession = issueSession(user);

  return success(res, {
    token: refreshedSession.token,
    accessToken: refreshedSession.token,
    refreshToken: refreshedSession.refreshToken,
  });
});

router.post('/logout', authenticate, (req, res) => {
  removeSession(req.session.token);
  return success(res, { message: 'Sesion cerrada' });
});

module.exports = router;
