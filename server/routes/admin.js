const express = require('express');
const router = express.Router();
const { Member, Settings, Task, Comment } = require('../models');
const { authenticate } = require('../middleware/auth');
const { isSuperAdmin } = require('../middleware/superAdmin');
const logger = require('../utils/logger');
const messages = require('../utils/messages');
const bcrypt = require('bcryptjs');

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
 * PUT /api/admin/members/:id
 * Update any member's details
 */
router.put('/members/:id', async (req, res) => {
  try {
    const memberId = req.params.id;
    const { name, email, password, role, avatar } = req.body;

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
      const salt = await bcrypt.genSalt(10);
      member.password = await bcrypt.hash(password, salt);
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

    // Update member's tasks and comments before deletion
    await Task.update({ assigneeId: null }, { where: { assigneeId: memberId } });
    await Task.update({ creatorId: null }, { where: { creatorId: memberId } });
    await Comment.destroy({ where: { senderId: memberId } });

    await member.destroy();
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
