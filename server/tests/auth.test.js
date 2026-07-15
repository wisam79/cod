const request = require('supertest');
const app = require('../server');
const { sequelize, Member } = require('../models');

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Sync the in-memory database
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Close the database connection
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear Member table before each test
    await Member.destroy({ where: {} });
  });

  describe('POST /api/auth/register', () => {
    it('should create a new member and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'أحمد',
          email: 'ahmed@example.com',
          password: 'Password123!',
          role: 'مطوّر'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.member).toHaveProperty('email', 'ahmed@example.com');
      expect(res.body.member).toHaveProperty('name', 'أحمد');
      expect(res.body.member).not.toHaveProperty('password');
    });

    it('should fail registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'ahmed@example.com',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should prevent duplicate registration', async () => {
      // Register one first
      await Member.create({
        name: 'أحمد',
        email: 'ahmed@example.com',
        password: 'Password123!',
        role: 'مطوّر'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'أحمد ثانٍ',
          email: 'ahmed@example.com',
          password: 'Password456!',
          role: 'مصمم'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('مستخدم بالفعل');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should log in an existing member with correct password', async () => {
      // Seed user
      await Member.create({
        name: 'أحمد',
        email: 'ahmed@example.com',
        password: 'Password123!',
        role: 'مطوّر'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ahmed@example.com',
          password: 'Password123!'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.member.name).toEqual('أحمد');
    });

    it('should fail login with wrong credentials', async () => {
      // Seed user
      await Member.create({
        name: 'أحمد',
        email: 'ahmed@example.com',
        password: 'Password123!',
        role: 'مطوّر'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ahmed@example.com',
          password: 'WrongPassword123!'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toContain('غير صحيحة');
    });
  });
});
