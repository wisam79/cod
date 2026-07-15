const request = require('supertest');
const app = require('../server');
const { sequelize, Member, Task, Settings } = require('../models');

describe('Super Admin Endpoints & Settings', () => {
  let superAdminToken;
  let regularToken;
  let regularUserId;

  beforeAll(async () => {
    // Sync the in-memory database
    await sequelize.sync({ force: true });

    // Seed default settings
    await Settings.upsert({ key: 'allowUserRegistration', value: 'true' });
    await Settings.upsert({ key: 'maintenanceMode', value: 'false' });
    await Settings.upsert({ key: 'maxTasksPerUser', value: '2' }); // Set max tasks to 2 for testing

    // Create Super Admin member
    const superAdminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'الادمن المطور',
        email: 'admin@mohemmaty.com',
        password: 'MohemmatySuperAdmin2026!',
        role: 'الادمن المطور'
      });
    superAdminToken = superAdminRes.body.token;

    // Create Regular member
    const regularRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'أحمد العادي',
        email: 'ahmed@mohemmaty.com',
        password: 'MohemmatySecureP@ss123!',
        role: 'مطور فرونت-إند'
      });
    regularToken = regularRes.body.token;
    regularUserId = regularRes.body.member.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/admin/members', () => {
    it('should allow Super Admin to fetch members', async () => {
      const res = await request(app)
        .get('/api/admin/members')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should block regular user from fetching members', async () => {
      const res = await request(app)
        .get('/api/admin/members')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET & PUT /api/admin/settings', () => {
    it('should allow Super Admin to fetch and update settings', async () => {
      // Get settings
      const getRes = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(getRes.statusCode).toEqual(200);
      expect(getRes.body.allowUserRegistration).toBe(true);

      // Update settings to block registration
      const putRes = await request(app)
        .put('/api/admin/settings')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          allowUserRegistration: false,
          maintenanceMode: false,
          maxTasksPerUser: 2
        });
      expect(putRes.statusCode).toEqual(200);
      expect(putRes.body.settings.allowUserRegistration).toBe('false');
    });
  });

  describe('Registration Block when disabled', () => {
    it('should prevent new registrations when self-registration is disabled', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'مستخدم جديد',
          email: 'newuser@mohemmaty.com',
          password: 'Password123!',
          role: 'مطور'
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Max active tasks limit constraint', () => {
    it('should block task creation if member active task count equals maxTasksPerUser', async () => {
      // Re-enable registration so we can test normally if needed
      await request(app)
        .put('/api/admin/settings')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          allowUserRegistration: true,
          maintenanceMode: false,
          maxTasksPerUser: 2
        });

      // Create task 1 (active)
      const res1 = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          title: 'مهمة 1',
          priority: 'medium',
          status: 'todo',
          assigneeId: regularUserId
        });
      expect(res1.statusCode).toEqual(201);

      // Create task 2 (active)
      const res2 = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          title: 'مهمة 2',
          priority: 'medium',
          status: 'progress',
          assigneeId: regularUserId
        });
      expect(res2.statusCode).toEqual(201);

      // Create task 3 (should fail because limit is 2)
      const res3 = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          title: 'مهمة 3',
          priority: 'medium',
          status: 'todo',
          assigneeId: regularUserId
        });
      expect(res3.statusCode).toEqual(400);
      expect(res3.body).toHaveProperty('error');
    });
  });
});
