const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { users, sessions } = require('../src/data/data');

describe('User endpoints', () => {
  beforeEach(async () => {
    users.length = 0;
    sessions.length = 0;
    users.push({
      id: 'u1',
      email: 'juan@example.com',
      username: 'juanperez',
      password: await bcrypt.hash('password123', 10),
      fullName: 'Juan Perez',
      phoneNumber: '+5491112345678',
      preferences: { categories: ['free_tour'], destinations: ['Buenos Aires'] },
      createdAt: '2026-01-15T10:00:00Z',
    });
  });

  describe('GET /api/users/me', () => {
    it('should return current user without password', async () => {
      sessions.push({
        token: 'me-token',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer me-token');
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('juan@example.com');
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/users/preferences', () => {
    it('should update user preferences', async () => {
      sessions.push({
        token: 'pref-token',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });
      const res = await request(app)
        .put('/api/users/preferences')
        .set('Authorization', 'Bearer pref-token')
        .send({
          categories: ['adventure', 'gastronomic'],
          destinations: ['Mendoza', 'Bariloche'],
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.preferences.categories).toEqual(['adventure', 'gastronomic']);
      expect(res.body.data.user.preferences.destinations).toEqual(['Mendoza', 'Bariloche']);
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should require authentication', async () => {
      const res = await request(app).put('/api/users/preferences').send({
        categories: ['adventure'],
        destinations: ['Mendoza'],
      });
      expect(res.status).toBe(401);
    });

    it('should reject missing categories or destinations', async () => {
      sessions.push({
        token: 'pref-token2',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });
      const res = await request(app)
        .put('/api/users/preferences')
        .set('Authorization', 'Bearer pref-token2')
        .send({ categories: ['adventure'] });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Categories y destinations son requeridos');
    });

    it('should reject non-array categories', async () => {
      sessions.push({
        token: 'pref-token3',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });
      const res = await request(app)
        .put('/api/users/preferences')
        .set('Authorization', 'Bearer pref-token3')
        .send({ categories: 'adventure', destinations: ['Mendoza'] });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Categories y destinations deben ser arrays');
    });
  });
});
