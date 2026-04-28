const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { users, sessions, activities } = require('../src/data/data');

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
      activities: [],
      preferences: { categories: ['free_tour'], destinations: ['Buenos Aires'] },
      createdAt: '2026-01-15T10:00:00Z',
    });

    users.push({
      id: 'u2',
      email: 'maria@example.com',
      username: 'mariagarcia',
      password: await bcrypt.hash('password456', 10),
      fullName: 'Maria Garcia',
      phoneNumber: '+5491165432100',
      activities: [],
      preferences: { categories: ['guided_visit'], destinations: ['Mendoza'] },
      createdAt: '2026-02-01T10:00:00Z',
    });

    const limitedActivity = activities.find((activity) => activity.id === 'a1');
    if (limitedActivity && Array.isArray(limitedActivity.schedules) && limitedActivity.schedules[0]) {
      limitedActivity.schedules[0].totalSpots = 1;
      limitedActivity.schedules[0].availableSpots = 1;
    }
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

  describe('GET /api/users/activities', () => {
    it('should return empty activity id list by default', async () => {
      sessions.push({
        token: 'activities-token',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const res = await request(app)
        .get('/api/users/activities')
        .set('Authorization', 'Bearer activities-token');

      expect(res.status).toBe(200);
      expect(res.body.data.detailedActivities).toEqual([]);
    });

    it('should return saved activity ids', async () => {
      sessions.push({
        token: 'list-token',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      await request(app)
        .post('/api/users/activities')
        .set('Authorization', 'Bearer list-token')
        .send({ activityId: 'a1', selectedDate: '2026-04-10T10:00:00Z' });

      const res = await request(app)
        .get('/api/users/activities')
        .set('Authorization', 'Bearer list-token');

      expect(res.status).toBe(200);
      expect(res.body.data.detailedActivities).toHaveLength(1);
      expect(res.body.data.detailedActivities[0]).toEqual({
        activityId: 'a1',
        activityName: 'Walking Tour por San Telmo',
        selectedDate: '2026-04-10T10:00:00.000Z',
        selectedScheduleId: 'a1-s1',
        quantity: 1,
        cancellationHours: 24,
        status: 'active',
      });
    });
  });

  describe('POST /api/users/activities', () => {
    it('should save an activity without status', async () => {
      sessions.push({
        token: 'save-token',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const firstResponse = await request(app)
        .post('/api/users/activities')
        .set('Authorization', 'Bearer save-token')
        .send({ activityId: 'a1', selectedDate: '2026-04-10T10:00:00Z' });

      expect(firstResponse.status).toBe(201);
      expect(firstResponse.body.data.detailedActivities).toHaveLength(1);
      expect(firstResponse.body.data.detailedActivities[0]).toEqual({
        activityId: 'a1',
        activityName: 'Walking Tour por San Telmo',
        selectedDate: '2026-04-10T10:00:00.000Z',
        selectedScheduleId: 'a1-s1',
        quantity: 1,
        cancellationHours: 24,
        status: 'active',
      });
    });

    it('should save an activity by schedule id', async () => {
      sessions.push({
        token: 'save-token-schedule',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const response = await request(app)
        .post('/api/users/activities')
        .set('Authorization', 'Bearer save-token-schedule')
        .send({ activityId: 'a1', selectedScheduleId: 'a1-s2' });

      expect(response.status).toBe(201);
      expect(response.body.data.detailedActivities).toHaveLength(1);
      expect(response.body.data.detailedActivities[0]).toEqual({
        activityId: 'a1',
        activityName: 'Walking Tour por San Telmo',
        selectedDate: '2026-04-17T10:00:00.000Z',
        selectedScheduleId: 'a1-s2',
        quantity: 1,
        cancellationHours: 24,
        status: 'active',
      });
    });

    it('should recalculate schedule availability after booking', async () => {
      sessions.push({
        token: 'dynamic-capacity-token',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const before = await request(app).get('/api/activities/a1');
      expect(before.status).toBe(200);
      expect(before.body.data.schedules[0].availableSpots).toBe(1);

      const booking = await request(app)
        .post('/api/users/activities')
        .set('Authorization', 'Bearer dynamic-capacity-token')
        .send({ activityId: 'a1', selectedScheduleId: 'a1-s1' });

      expect(booking.status).toBe(201);

      const after = await request(app).get('/api/activities/a1');
      expect(after.status).toBe(200);
      expect(after.body.data.schedules[0].availableSpots).toBe(0);
    });

    it('should reject booking when no spots remain', async () => {
      sessions.push({
        token: 'full-capacity-u1-token',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      sessions.push({
        token: 'full-capacity-u2-token',
        userId: 'u2',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const firstBooking = await request(app)
        .post('/api/users/activities')
        .set('Authorization', 'Bearer full-capacity-u1-token')
        .send({ activityId: 'a1', selectedScheduleId: 'a1-s1' });

      expect(firstBooking.status).toBe(201);

      const secondBooking = await request(app)
        .post('/api/users/activities')
        .set('Authorization', 'Bearer full-capacity-u2-token')
        .send({ activityId: 'a1', selectedScheduleId: 'a1-s1' });

      expect(secondBooking.status).toBe(409);
      expect(secondBooking.body.error).toBe('No hay cupos disponibles para la fecha seleccionada');
    });

    it('should reject when selectedDate and selectedScheduleId are missing', async () => {
      sessions.push({
        token: 'save-token-2',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const res = await request(app)
        .post('/api/users/activities')
        .set('Authorization', 'Bearer save-token-2')
        .send({ activityId: 'a1' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('selectedDate o selectedScheduleId es requerido');
    });

    it('should reject when selectedDate is not available for activity', async () => {
      sessions.push({
        token: 'save-token-3',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const res = await request(app)
        .post('/api/users/activities')
        .set('Authorization', 'Bearer save-token-3')
        .send({ activityId: 'a1', selectedDate: '2030-01-01T10:00:00Z' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('selectedDate no disponible para la actividad');
    });

    it('should reject when selectedScheduleId is not available for activity', async () => {
      sessions.push({
        token: 'save-token-4',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const res = await request(app)
        .post('/api/users/activities')
        .set('Authorization', 'Bearer save-token-4')
        .send({ activityId: 'a1', selectedScheduleId: 'a1-s99' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('selectedScheduleId no disponible para la actividad');
    });

    it('should save an activity by schedule id', async () => {
      sessions.push({
        token: 'save-token-schedule',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const response = await request(app)
        .post('/api/users/activities')
        .set('Authorization', 'Bearer save-token-schedule')
        .send({ activityId: 'a1', selectedScheduleId: 'a1-s2' });

      expect(response.status).toBe(201);
      expect(response.body.data.activity).toEqual({
        activityId: 'a1',
        selectedDate: '2026-04-17T10:00:00.000Z',
        selectedScheduleId: 'a1-s2',
      });
    });

    it('should recalculate schedule availability after booking', async () => {
      sessions.push({
        token: 'dynamic-capacity-token',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const before = await request(app).get('/api/activities/a1');
      expect(before.status).toBe(200);
      expect(before.body.data.schedules[0].availableSpots).toBe(1);

      const booking = await request(app)
        .post('/api/users/activities')
        .set('Authorization', 'Bearer dynamic-capacity-token')
        .send({ activityId: 'a1', selectedScheduleId: 'a1-s1' });

      expect(booking.status).toBe(201);

      const after = await request(app).get('/api/activities/a1');
      expect(after.status).toBe(200);
      expect(after.body.data.schedules[0].availableSpots).toBe(0);
    });

    it('should reject booking when no spots remain', async () => {
      sessions.push({
        token: 'full-capacity-u1-token',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      sessions.push({
        token: 'full-capacity-u2-token',
        userId: 'u2',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const firstBooking = await request(app)
        .post('/api/users/activities')
        .set('Authorization', 'Bearer full-capacity-u1-token')
        .send({ activityId: 'a1', selectedScheduleId: 'a1-s1' });

      expect(firstBooking.status).toBe(201);

      const secondBooking = await request(app)
        .post('/api/users/activities')
        .set('Authorization', 'Bearer full-capacity-u2-token')
        .send({ activityId: 'a1', selectedScheduleId: 'a1-s1' });

      expect(secondBooking.status).toBe(409);
      expect(secondBooking.body.error).toBe('No hay cupos disponibles para la fecha seleccionada');
    });

    it('should reject when selectedDate and selectedScheduleId are missing', async () => {
      sessions.push({
        token: 'save-token-2',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const res = await request(app)
        .post('/api/users/activities')
        .set('Authorization', 'Bearer save-token-2')
        .send({ activityId: 'a1' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('selectedDate o selectedScheduleId es requerido');
    });

    it('should reject when selectedDate is not available for activity', async () => {
      sessions.push({
        token: 'save-token-3',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const res = await request(app)
        .post('/api/users/activities')
        .set('Authorization', 'Bearer save-token-3')
        .send({ activityId: 'a1', selectedDate: '2030-01-01T10:00:00Z' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('selectedDate no disponible para la actividad');
    });

    it('should reject when selectedScheduleId is not available for activity', async () => {
      sessions.push({
        token: 'save-token-4',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const res = await request(app)
        .post('/api/users/activities')
        .set('Authorization', 'Bearer save-token-4')
        .send({ activityId: 'a1', selectedScheduleId: 'a1-s99' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('selectedScheduleId no disponible para la actividad');
    });
  });
});
