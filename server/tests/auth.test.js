const request = require('supertest');
const crypto = require('crypto');
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
          email: 'ahmed',
          password: '123456',
          role: 'مطوّر'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.member).toHaveProperty('email', 'ahmed');
      expect(res.body.member).toHaveProperty('name', 'أحمد');
      expect(res.body.member).not.toHaveProperty('password');
    });

    it('should fail registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'ahmed',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should prevent duplicate registration', async () => {
      // Register one first
      await Member.create({
        name: 'أحمد',
        email: 'ahmed',
        password: '123456',
        role: 'مطوّر'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'أحمد ثانٍ',
          email: 'ahmed',
          password: '654321',
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
        email: 'ahmed',
        password: '123456',
        role: 'مطوّر'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ahmed',
          password: '123456'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.member.name).toEqual('أحمد');
    });

    it('should fail login with wrong credentials', async () => {
      // Seed user
      await Member.create({
        name: 'أحمد',
        email: 'ahmed',
        password: '123456',
        role: 'مطوّر'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ahmed',
          password: '000000'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toContain('غير صحيح');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should generate a token and send a password reset email if email exists', async () => {
      await Member.create({
        name: 'أحمد',
        email: 'ahmed',
        password: '123456',
        role: 'مطوّر'
      });

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'ahmed' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('تم إرسال رابط');

      const member = await Member.findOne({ where: { email: 'ahmed' } });
      expect(member.resetPasswordToken).not.toBeNull();
      expect(member.resetPasswordExpires).not.toBeNull();
    });

    it('should return security-friendly message if email does not exist', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonex' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('تم إرسال رابط إعادة تعيين كلمة المرور');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should successfully reset password with valid token', async () => {
      const token = 'valid-token-12345';
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const expiry = new Date(Date.now() + 3600000);
      await Member.create({
        name: 'أحمد',
        email: 'ahmed',
        password: '123456',
        role: 'مطوّر',
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expiry
      });

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token,
          password: '111111'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('تم إعادة تعيين كلمة المرور بنجاح');

      const member = await Member.findOne({ where: { email: 'ahmed' } });
      expect(member.resetPasswordToken).toBeNull();
      expect(member.resetPasswordExpires).toBeNull();
      const isMatch = await member.comparePassword('111111');
      expect(isMatch).toBe(true);
    });

    it('should reject password reset with expired or invalid token', async () => {
      const token = 'expired-token-12345';
      const expiry = new Date(Date.now() - 3600000);
      await Member.create({
        name: 'أحمد',
        email: 'ahmed',
        password: '123456',
        role: 'مطوّر',
        resetPasswordToken: token,
        resetPasswordExpires: expiry
      });

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token,
          password: '111111'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('رمز إعادة تعيين كلمة المرور غير صالح');
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update name and avatar of authenticated user', async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'أحمد',
          email: 'ahmed',
          password: '123456',
          role: 'مطوّر'
        });

      const token = registerRes.body.token;

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'أحمد المحدث',
          avatar: 'https://example.com/avatar.png'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.member.name).toEqual('أحمد المحدث');
      expect(res.body.member.avatar).toEqual('https://example.com/avatar.png');

      const member = await Member.findByPk(registerRes.body.member.id);
      expect(member.name).toEqual('أحمد المحدث');
    });
  });

  describe('PUT /api/auth/change-password', () => {
    it('should successfully change password with valid current password', async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'أحمد',
          email: 'ahmed',
          password: '123456',
          role: 'مطوّر'
        });

      const token = registerRes.body.token;

      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: '123456',
          newPassword: '111111'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('بنجاح');

      const member = await Member.findByPk(registerRes.body.member.id);
      const isMatch = await member.comparePassword('111111');
      expect(isMatch).toBe(true);
    });

    it('should reject password change with incorrect current password', async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'أحمد',
          email: 'ahmed',
          password: '123456',
          role: 'مطوّر'
        });

      const token = registerRes.body.token;

      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: '000000',
          newPassword: '111111'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('الحالية غير صحيحة');
    });
  });
});
