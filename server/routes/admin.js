const express = require('express');
const router = express.Router();
const { Member, Settings, Task, Comment } = require('../models');
const { authenticate } = require('../middleware/auth');
const { isSuperAdmin } = require('../middleware/superAdmin');
const logger = require('../utils/logger');
const messages = require('../utils/messages');
const { VALID_ROLES } = require('../utils/roles');

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
    res.status(500).json({ error: messages.admin.fetchMembersError });
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
      return res.status(400).json({ error: messages.admin.nameInvalid });
    }
    if (!email || typeof email !== 'string' || !/^[\u0600-\u06FFa-zA-Z]{5}$/.test(email)) {
      return res.status(400).json({ error: messages.admin.emailInvalid });
    }
    if (!password || typeof password !== 'string' || !/^[0-9]{6}$/.test(password)) {
      return res.status(400).json({ error: messages.admin.pinInvalid });
    }

    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: messages.admin.roleInvalid(VALID_ROLES) });
    }

    if (avatar && typeof avatar !== 'string') {
      return res.status(400).json({ error: messages.admin.avatarTypeInvalid });
    }
    if (avatar) {
      try { new URL(avatar); } catch {
        return res.status(400).json({ error: messages.admin.avatarInvalid });
      }
    }

    // Check if email already exists
    const exists = await Member.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: messages.admin.emailInUse });
    }

    const newMember = await Member.create({
      name,
      email,
      password,
      role: role || messages.admin.defaultRole,
      avatar: avatar || ''
    });

    logger.info(`Admin created new member: ${newMember.name} (ID: ${newMember.id})`);

    res.status(201).json({
      message: messages.admin.createSuccess,
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
    res.status(500).json({ error: messages.admin.createError });
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
        return res.status(400).json({ error: messages.admin.nameInvalid });
      }
    }
    if (email !== undefined) {
      if (typeof email !== 'string' || !/^[\u0600-\u06FFa-zA-Z]{5}$/.test(email)) {
        return res.status(400).json({ error: messages.admin.emailInvalid });
      }
    }
    if (avatar !== undefined && avatar !== null && avatar !== '') {
      if (typeof avatar !== 'string') {
        return res.status(400).json({ error: messages.admin.avatarTypeInvalid });
      }
      try { new URL(avatar); } catch {
        return res.status(400).json({ error: messages.admin.avatarInvalid });
      }
    }

    const member = await Member.findByPk(memberId);
    if (!member) {
      return res.status(404).json({ error: messages.admin.memberNotFound });
    }

    if (name) member.name = name;
    if (email) member.email = email;
    if (role) {
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ error: messages.admin.roleInvalid(VALID_ROLES) });
      }
      member.role = role;
    }
    if (avatar !== undefined) member.avatar = avatar;

    if (password && password.trim() !== '') {
      if (!/^[0-9]{6}$/.test(password)) {
        return res.status(400).json({ 
          error: messages.admin.pinInvalid 
        });
      }
      member.password = password; // beforeUpdate hook will handle hashing
    }

    await member.save();
    logger.info(`Admin updated details for member: ${member.name} (ID: ${member.id})`);

    res.json({
      message: messages.admin.updateSuccess,
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
      return res.status(400).json({ error: messages.admin.emailInUse });
    }
    res.status(500).json({ error: messages.admin.updateError });
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
      return res.status(400).json({ error: messages.admin.cannotDeleteSelf });
    }

    const member = await Member.findByPk(memberId);
    if (!member) {
      return res.status(404).json({ error: messages.admin.memberNotFound });
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

    res.json({ message: messages.admin.deleteSuccess });
  } catch (error) {
    logger.error('Admin API error deleting member: %o', error);
    res.status(500).json({ error: messages.admin.deleteError });
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
    res.status(500).json({ error: messages.admin.settingsFetchError });
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
    res.json({ message: messages.admin.settingsSaveSuccess, settings: updates });
  } catch (error) {
    logger.error('Admin API error updating settings: %o', error);
    res.status(500).json({ error: messages.admin.settingsSaveError });
  }
});

module.exports = router;
