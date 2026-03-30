const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { users, otpCodes, sessions } = require('../src/data/data');

describe('Auth endpoints', () => {
  let originalUsers;

  beforeEach(async () => {
    // Reset data state
    users.length = 0;
    otpCodes.length = 0;
    sessions.length = 0;
    users.push(
      {
        id: 'u1',
        email: 'juan@example.com',
        username: 'juanperez',
        password: await bcrypt.hash('password123', 10),
        fullName: 'Juan Perez',
        preferences: { categories: ['free_tour', 'adventure'], destinations: ['Buenos Aires'] },
        createdAt: '2026-01-15T10:00:00Z',
      },
      {
        id: 'u2',
        email: 'maria@example.com',
        username: 'mariagarcia',
        password: await bcrypt.hash('password456', 10),
        fullName: 'Maria Garcia',
        preferences: {
          categories: ['gastronomic', 'guided_visit'],
          destinations: ['Mendoza', 'Bariloche'],
        },
        createdAt: '2026-02-01T10:00:00Z',
      },
    );
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'new@example.com',
        username: 'newuser',
        password: 'password789',
        fullName: 'New User',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('new@example.com');
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should reject duplicate email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'juan@example.com',
        username: 'otherusername',
        password: 'password789',
        fullName: 'Another User',
      });
      expect(res.status).toBe(409);
      expect(res.body.error).toBe('El email ya esta registrado');
    });

    it('should reject duplicate username', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'unique@example.com',
        username: 'juanperez',
        password: 'password789',
        fullName: 'Another User',
      });
      expect(res.status).toBe(409);
      expect(res.body.error).toBe('El username ya esta en uso');
    });

    it('should reject missing fields', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Todos los campos son requeridos');
    });

    it('should reject invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'invalid',
        username: 'validuser',
        password: 'password789',
        fullName: 'Test User',
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email invalido');
    });

    it('should reject short password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'short@example.com',
        username: 'shortpw',
        password: '12345',
        fullName: 'Test User',
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('La contrasena debe tener al menos 6 caracteres');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        username: 'juanperez',
        password: 'password123',
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.username).toBe('juanperez');
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should reject wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        username: 'juanperez',
        password: 'wrongpassword',
      });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Credenciales invalidas');
    });

    it('should reject unknown username', async () => {
      const res = await request(app).post('/api/auth/login').send({
        username: 'nonexistent',
        password: 'password123',
      });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Credenciales invalidas');
    });

    it('should reject missing fields', async () => {
      const res = await request(app).post('/api/auth/login').send({
        username: 'juanperez',
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Username y contrasena son requeridos');
    });
  });

  describe('POST /api/auth/otp/request', () => {
    it('should generate OTP for valid email', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const res = await request(app).post('/api/auth/otp/request').send({
        email: 'juan@example.com',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('Codigo OTP enviado');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[OTP]'));
      consoleSpy.mockRestore();
    });

    it('should reject invalid email', async () => {
      const res = await request(app).post('/api/auth/otp/request').send({
        email: 'invalid',
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email invalido');
    });
  });

  describe('POST /api/auth/otp/verify', () => {
    it('should verify valid OTP and return token', async () => {
      otpCodes.push({
        email: 'juan@example.com',
        code: '123456',
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        used: false,
      });
      const res = await request(app).post('/api/auth/otp/verify').send({
        email: 'juan@example.com',
        code: '123456',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should reject wrong OTP code', async () => {
      otpCodes.push({
        email: 'juan@example.com',
        code: '123456',
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        used: false,
      });
      const res = await request(app).post('/api/auth/otp/verify').send({
        email: 'juan@example.com',
        code: '654321',
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Codigo OTP incorrecto');
    });

    it('should reject expired OTP', async () => {
      otpCodes.push({
        email: 'juan@example.com',
        code: '111111',
        expiresAt: new Date(Date.now() - 1000).toISOString(),
        used: false,
      });
      const res = await request(app).post('/api/auth/otp/verify').send({
        email: 'juan@example.com',
        code: '111111',
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Codigo OTP expirado');
    });

    it('should reject already used OTP', async () => {
      otpCodes.push({
        email: 'juan@example.com',
        code: '222222',
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        used: true,
      });
      const res = await request(app).post('/api/auth/otp/verify').send({
        email: 'juan@example.com',
        code: '222222',
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Codigo OTP incorrecto');
    });
  });

  describe('POST /api/auth/otp/resend', () => {
    it('should resend OTP and invalidate previous ones', async () => {
      otpCodes.push({
        email: 'juan@example.com',
        code: '111111',
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        used: false,
      });
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const res = await request(app).post('/api/auth/otp/resend').send({
        email: 'juan@example.com',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('Codigo OTP reenviado');
      // Previous OTP should be invalidated
      expect(otpCodes[0].used).toBe(true);
      consoleSpy.mockRestore();
    });

    it('should reject invalid email', async () => {
      const res = await request(app).post('/api/auth/otp/resend').send({
        email: 'invalid',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout authenticated user', async () => {
      sessions.push({
        token: 'test-token',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer test-token');
      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('Sesion cerrada');
      expect(sessions.find((s) => s.token === 'test-token')).toBeUndefined();
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user without password', async () => {
      sessions.push({
        token: 'me-token',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer me-token');
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('juan@example.com');
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
