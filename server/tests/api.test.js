const request = require('supertest');
const app = require('../server');
const { sequelize, Member } = require('../models');

beforeAll(async () => {
  // Sync the database for testing (in-memory SQLite will be used as configured in database.js)
  await sequelize.sync({ force: true });
  
  // Seed a test member
  await Member.create({
    id: 1,
    name: 'جاسم يعقوب',
    email: 'jassem@mohemmaty.com',
    password: 'MohemmatySecureP@ss123!',
    role: 'مصمم واجهات UI/UX',
    avatar: 'https://ui-avatars.com/api/?name=Test+User&background=random&color=fff'
  });
});

afterAll(async () => {
  // Close database connection
  await sequelize.close();
});

describe('مُهِمَّتِي - اختبارات واجهة البرمجة (API Tests)', () => {
  
  test('صحة السيرفر - /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body.status).toEqual('healthy');
  });

  test('فشل المصادقة عند جلب المهام بدون توكن JWT', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error');
  });

  test('فشل تسجيل الدخول ببيانات خاطئة', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jassem@mohemmaty.com',
        password: 'wrongpassword'
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error');
  });

  test('نجاح تسجيل الدخول بالبيانات الصحيحة والحصول على توكن JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jassem@mohemmaty.com',
        password: 'MohemmatySecureP@ss123!'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('member');
    expect(res.body.member.email).toEqual('jassem@mohemmaty.com');
  });

  describe('Security and Validation Checks', () => {
    let authToken = '';

    beforeAll(async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jassem@mohemmaty.com',
          password: 'MohemmatySecureP@ss123!'
        });
      authToken = loginRes.body.token;
    });

    test('فشل التسجيل بكلمة مرور ضعيفة', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'صالح',
          email: 'saleh@mohemmaty.com',
          password: 'weak',
          role: 'مطوّر'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('كلمة المرور');
    });

    test('فشل التسجيل ببريد إلكتروني غير صالح', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'صالح',
          email: 'invalid-email',
          password: 'Password123!',
          role: 'مطوّر'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('بريد إلكتروني');
    });

    test('فشل التسجيل برابط صورة شخصية غير صالح', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'صالح',
          email: 'saleh@mohemmaty.com',
          password: 'Password123!',
          role: 'مطوّر',
          avatar: 'not-a-valid-url'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('الصورة الشخصية');
    });

    test('فشل إضافة مهمة بتاريخ في الماضي', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'مهمة منتهية الصلاحية',
          dueDate: '2020-01-01'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('تاريخ الاستحقاق');
    });

    test('فشل إرسال تعليق فارغ أو يحتوي على وسوم HTML فقط', async () => {
      // First create a task to comment on
      const taskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'مهمة للاختبار',
          dueDate: '2030-01-01'
        });
      const taskId = taskRes.body.id;

      const res = await request(app)
        .post(`/api/tasks/${taskId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: '<p>   </p>'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('التعليق');
    });

    test('التحقق من ملكية التعليق عند الحذف', async () => {
      // Create user 2 (Saleh)
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'صالح',
          email: 'saleh2@mohemmaty.com',
          password: 'Password123!',
          role: 'مطوّر'
        });
      const salehToken = registerRes.body.token;

      // Create a task
      const taskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'مهمة تعليقات',
          dueDate: '2030-01-01'
        });
      const taskId = taskRes.body.id;

      // User 1 (Jassem) adds a comment
      const commentRes = await request(app)
        .post(`/api/tasks/${taskId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'تعليق جاسم'
        });
      const commentId = commentRes.body.id;

      // User 2 (Saleh) tries to delete Jassem's comment -> Should fail with 403 Forbidden
      const deleteRes = await request(app)
        .delete(`/api/tasks/comments/${commentId}`)
        .set('Authorization', `Bearer ${salehToken}`);
      
      expect(deleteRes.statusCode).toEqual(403);
      expect(deleteRes.body.error).toContain('غير مسموح');

      // User 1 (Jassem) deletes own comment -> Should succeed
      const deleteSuccessRes = await request(app)
        .delete(`/api/tasks/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(deleteSuccessRes.statusCode).toEqual(200);
    });
  });
});
