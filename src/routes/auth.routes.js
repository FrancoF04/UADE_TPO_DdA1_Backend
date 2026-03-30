const { Router } = require('express');
const bcrypt = require('bcryptjs');
const {
  findUserByEmail,
  findUserByUsername,
  addUser,
  addOtp,
  addSession,
  removeSession,
  invalidateOtpsForEmail,
  otpCodes,
} = require('../data/data');
const { success, error } = require('../utils/response');
const { isValidEmail, isValidOtp, isValidUsername, isValidPassword } = require('../utils/validation');
const { generateOtp, isOtpExpired } = require('../utils/otp');
const { generateToken } = require('../utils/token');
const { authenticate } = require('../middleware/auth');

const router = Router();

const sanitizeUser = (user) => {
  const { password: _password, ...sanitized } = user;
  return sanitized;
};

router.post('/otp/request', (req, res) => {
  const { email } = req.body;
  if (!email || !isValidEmail(email)) {
    return error(res, 'Email invalido', 400);
  }
  const user = findUserByEmail(email);
  if (!user) {
    return error(res, 'No existe una cuenta con ese email', 404);
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
      preferences: { categories: [], destinations: [] },
      createdAt: new Date().toISOString(),
    });
  }
  const token = generateToken();
  addSession({
    token,
    userId: user.id,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  return success(res, { token, user: sanitizeUser(user) });
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
  const { email, username, password, fullName } = req.body;
  if (!email || !username || !password || !fullName) {
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
    preferences: { categories: [], destinations: [] },
    createdAt: new Date().toISOString(),
  });
  return success(res, { user: sanitizeUser(user) }, null, 201);
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
  const token = generateToken();
  addSession({
    token,
    userId: user.id,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  return success(res, { token, user: sanitizeUser(user) });
});

router.post('/logout', authenticate, (req, res) => {
  removeSession(req.session.token);
  return success(res, { message: 'Sesion cerrada' });
});

router.get('/me', authenticate, (req, res) => {
  return success(res, { user: sanitizeUser(req.user) });
});

module.exports = router;
