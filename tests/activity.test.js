const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { users, sessions, activities } = require('../src/data/data');

describe('Activity endpoints', () => {
  beforeEach(async () => {
    users.length = 0;
    sessions.length = 0;
    users.push({
      id: 'u1',
      email: 'juan@example.com',
      username: 'juanperez',
      password: await bcrypt.hash('password123', 10),
      fullName: 'Juan Perez',
      preferences: { categories: ['free_tour', 'adventure'], destinations: ['Buenos Aires'] },
      createdAt: '2026-01-15T10:00:00Z',
    });
  });

  describe('GET /api/activities', () => {
    it('should return paginated results with default pagination', async () => {
      const res = await request(app).get('/api/activities');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(10);
      expect(res.body.meta.total).toBe(activities.length);
      expect(res.body.data.length).toBeLessThanOrEqual(10);
    });

    it('should support custom page and limit', async () => {
      const res = await request(app).get('/api/activities?page=2&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(2);
      expect(res.body.meta.limit).toBe(5);
    });

    it('should return empty data for out-of-range page', async () => {
      const res = await request(app).get('/api/activities?page=100');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('should filter by destination', async () => {
      const res = await request(app).get('/api/activities?destination=Buenos Aires');
      expect(res.status).toBe(200);
      res.body.data.forEach((activity) => {
        expect(activity.destination).toBe('Buenos Aires');
      });
    });

    it('should filter by category', async () => {
      const res = await request(app).get('/api/activities?category=free_tour');
      expect(res.status).toBe(200);
      res.body.data.forEach((activity) => {
        expect(activity.category).toBe('free_tour');
      });
    });

    it('should filter by price range', async () => {
      const res = await request(app).get('/api/activities?priceMin=10000&priceMax=30000');
      expect(res.status).toBe(200);
      res.body.data.forEach((activity) => {
        expect(activity.price).toBeGreaterThanOrEqual(10000);
        expect(activity.price).toBeLessThanOrEqual(30000);
      });
    });

    it('should support combined filters', async () => {
      const res = await request(app).get(
        '/api/activities?destination=Buenos Aires&category=free_tour',
      );
      expect(res.status).toBe(200);
      res.body.data.forEach((activity) => {
        expect(activity.destination).toBe('Buenos Aires');
        expect(activity.category).toBe('free_tour');
      });
    });
  });

  describe('GET /api/activities/featured', () => {
    it('should return only featured activities', async () => {
      const res = await request(app).get('/api/activities/featured');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((activity) => {
        expect(activity.featured).toBe(true);
      });
    });

    it('should respect limit parameter', async () => {
      const res = await request(app).get('/api/activities/featured?limit=2');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/activities/recommended', () => {
    it('should return activities matching user preferences', async () => {
      sessions.push({
        token: 'rec-token',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });
      const res = await request(app)
        .get('/api/activities/recommended')
        .set('Authorization', 'Bearer rec-token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.forEach((activity) => {
        const matchesCategory = ['free_tour', 'adventure'].includes(activity.category);
        const matchesDestination = ['Buenos Aires'].includes(activity.destination);
        expect(matchesCategory || matchesDestination).toBe(true);
      });
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/activities/recommended');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/activities/filters', () => {
    it('should return distinct destinations and categories', async () => {
      const res = await request(app).get('/api/activities/filters');
      expect(res.status).toBe(200);
      expect(res.body.data.destinations).toBeInstanceOf(Array);
      expect(res.body.data.categories).toBeInstanceOf(Array);
      expect(res.body.data.destinations.length).toBeGreaterThan(0);
      expect(res.body.data.categories.length).toBeGreaterThan(0);
      // Check uniqueness
      expect(new Set(res.body.data.destinations).size).toBe(res.body.data.destinations.length);
      expect(new Set(res.body.data.categories).size).toBe(res.body.data.categories.length);
    });
  });

  describe('GET /api/activities/:id', () => {
    it('should return a single activity', async () => {
      const res = await request(app).get('/api/activities/a1');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('a1');
      expect(res.body.data.name).toBeDefined();
    });

    it('should return 404 for invalid id', async () => {
      const res = await request(app).get('/api/activities/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Actividad no encontrada');
    });
  });
});
