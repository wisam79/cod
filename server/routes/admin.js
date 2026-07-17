const express = require('express');
const router = express.Router();
const { Member, Settings, Task, Comment } = require('../models');
const { authenticate } = require('../middleware/auth');
const { isSuperAdmin } = require('../middleware/superAdmin');
const logger = require('../utils/logger');
const messages = require('../utils/messages');
const VALID_ROLES = ['مصمم واجهات UI/UX', 'مطور فرونت-إند', 'مطور باك-إند', 'مديرة المنتج', 'الادمن المطور'];

// All routes here require being logged in and being a Super Admin (الادمن المطور)
router.use(authenticate, isSuperAdmin);

/**
 * GET /api/admin/members
 * Get all members in the system
 */
router.get('/members', async (req, res) => {
  try {
    const members = await Member.findAll({
      attributes: ['id', 'name', 'email', 'role', 'avatar', 'createdAt']
    });
    res.json(members);
  } catch (error) {
    logger.error('Admin API error fetching members: %o', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الأعضاء.' });
  }
});

/**
 * POST /api/admin/members
 * Create a new member by Admin
 */
router.post('/members', async (req, res) => {
  try {
    const { name, email, password, role, avatar } = req.body;

    // Validate inputs
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'الاسم يجب أن يكون نصاً بطول حرفين على الأقل.' });
    }
    if (!email || typeof email !== 'string' || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({ error: 'البريد الإلكتروني غير صالح.' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'كلمة المرور مطلوبة.' });
    }
    
    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: 'كلمة المرور ضعيفة جداً. يجب أن تحتوي على 8 رموز كحد أدنى وتتضمن أحرف كبيرة وصغيرة وأرقام ورمز خاص.' 
      });
    }

    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: 'الدور المحدد غير صالح. الأدوار المسموح بها: ' + VALID_ROLES.join('، ') });
    }

    if (avatar && typeof avatar !== 'string') {
      return res.status(400).json({ error: 'رابط الصورة الرمزية غير صالح.' });
    }
    if (avatar) {
      try { new URL(avatar); } catch {
        return res.status(400).json({ error: 'رابط الصورة الرمزية غير صالح.' });
      }
    }

    // Check if email already exists
    const exists = await Member.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل.' });
    }

    const newMember = await Member.create({
      name,
      email,
      password,
      role: role || 'عضو عادي',
      avatar: avatar || ''
    });

    logger.info(`Admin created new member: ${newMember.name} (ID: ${newMember.id})`);

    res.status(201).json({
      message: 'تم إضافة العضو بنجاح.',
      member: {
        id: newMember.id,
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        avatar: newMember.avatar,
        createdAt: newMember.createdAt
      }
    });
  } catch (error) {
    logger.error('Admin API error creating member: %o', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إضافة العضو الجديد.' });
  }
});

/**
 * PUT /api/admin/members/:id
 * Update any member's details
 */
router.put('/members/:id', async (req, res) => {
  try {
    const memberId = req.params.id;
    const { name, email, password, role, avatar } = req.body;

    // Validate inputs
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ error: 'الاسم يجب أن يكون نصاً بطول حرفين على الأقل.' });
      }
    }
    if (email !== undefined) {
      if (typeof email !== 'string' || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        return res.status(400).json({ error: 'البريد الإلكتروني غير صالح.' });
      }
    }
    if (avatar !== undefined && avatar !== null && avatar !== '') {
      if (typeof avatar !== 'string') {
        return res.status(400).json({ error: 'رابط الصورة الرمزية غير صالح.' });
      }
      try { new URL(avatar); } catch {
        return res.status(400).json({ error: 'رابط الصورة الرمزية غير صالح.' });
      }
    }

    const member = await Member.findByPk(memberId);
    if (!member) {
      return res.status(404).json({ error: 'العضو غير موجود.' });
    }

    if (name) member.name = name;
    if (email) member.email = email;
    if (role) {
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ error: 'الدور المحدد غير صالح. الأدوار المسموح بها: ' + VALID_ROLES.join('، ') });
      }
      member.role = role;
    }
    if (avatar !== undefined) member.avatar = avatar;

    if (password && password.trim() !== '') {
      // Validate password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
          error: 'كلمة المرور ضعيفة جداً. يجب أن تحتوي على 8 رموز كحد أدنى وتتضمن أحرف كبيرة وصغيرة وأرقام ورمز خاص.' 
        });
      }
      member.password = password; // beforeUpdate hook will handle hashing
    }

    await member.save();
    logger.info(`Admin updated details for member: ${member.name} (ID: ${member.id})`);

    res.json({
      message: 'تم تحديث بيانات العضو بنجاح.',
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        avatar: member.avatar
      }
    });
  } catch (error) {
    logger.error('Admin API error updating member: %o', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل.' });
    }
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث بيانات العضو.' });
  }
});

/**
 * DELETE /api/admin/members/:id
 * Delete any member from the system
 */
router.delete('/members/:id', async (req, res) => {
  try {
    const memberId = req.params.id;
    
    // Prevent admin from deleting themselves
    if (Number(memberId) === req.user.id) {
      return res.status(400).json({ error: 'لا يمكنك حذف حسابك الشخصي الذي تستخدمه حالياً.' });
    }

    const member = await Member.findByPk(memberId);
    if (!member) {
      return res.status(404).json({ error: 'العضو غير موجود.' });
    }

    const { sequelize } = require('../models');
    const transaction = await sequelize.transaction();
    try {
      await Task.update({ assigneeId: null }, { where: { assigneeId: memberId }, transaction });
      await Task.update({ creatorId: null }, { where: { creatorId: memberId }, transaction });
      await Comment.destroy({ where: { senderId: memberId }, transaction });
      await member.destroy({ transaction });
      await transaction.commit();
    } catch (txError) {
      await transaction.rollback();
      throw txError;
    }
    logger.info(`Admin deleted member: ${member.name} (ID: ${memberId})`);

    res.json({ message: 'تم حذف العضو وتحديث المهام المرتبطة به بنجاح.' });
  } catch (error) {
    logger.error('Admin API error deleting member: %o', error);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف العضو.' });
  }
});

/**
 * GET /api/admin/settings
 * Fetch all application settings
 */
router.get('/settings', async (req, res) => {
  try {
    const settingsList = await Settings.findAll();
    const settingsMap = {};
    settingsList.forEach(s => {
      settingsMap[s.key] = s.value;
    });
    res.json({
      allowUserRegistration: settingsMap['allowUserRegistration'] !== 'false', // Default true
      maintenanceMode: settingsMap['maintenanceMode'] === 'true', // Default false
      maxTasksPerUser: parseInt(settingsMap['maxTasksPerUser'] || '10', 10) // Default 10
    });
  } catch (error) {
    logger.error('Admin API error fetching settings: %o', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الإعدادات.' });
  }
});

/**
 * PUT /api/admin/settings
 * Save application settings
 */
router.put('/settings', async (req, res) => {
  try {
    const { allowUserRegistration, maintenanceMode, maxTasksPerUser } = req.body;

    const updates = {
      allowUserRegistration: allowUserRegistration !== undefined ? String(allowUserRegistration) : 'true',
      maintenanceMode: maintenanceMode !== undefined ? String(maintenanceMode) : 'false',
      maxTasksPerUser: maxTasksPerUser !== undefined ? String(maxTasksPerUser) : '10'
    };

    for (const [key, value] of Object.entries(updates)) {
      await Settings.upsert({ key, value });
    }

    logger.info('System settings updated by Admin');
    res.json({ message: 'تم حفظ الإعدادات بنجاح.', settings: updates });
  } catch (error) {
    logger.error('Admin API error updating settings: %o', error);
    res.status(500).json({ error: 'حدث خطأ أثناء حفظ الإعدادات.' });
  }
});

module.exports = router;
