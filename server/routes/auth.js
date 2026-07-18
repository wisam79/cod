const express = require('express');
const jwt = require('jsonwebtoken');
const { Member } = require('../models');
const { JWT_SECRET, authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const { 
  validateRegister, 
  validateLogin, 
  validateForgotPassword, 
  validateResetPassword,
  validateProfileUpdate,
  validateChangePassword
} = require('../middleware/validation');
const { sendPasswordResetEmail } = require('../services/emailService');
const crypto = require('crypto');
const logger = require('../utils/logger');
const messages = require('../utils/messages');

const router = express.Router();

// Apply auth rate limiting
router.use(authLimiter);

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    let { email, password } = req.body;

    const member = await Member.findOne({ where: { email } });
    if (!member) {
      return res.status(401).json({ error: messages.auth.invalidCredentials });
    }

    if (member.isLocked()) {
      return res.status(423).json({ error: messages.auth.accountLocked });
    }

    const isMatch = await member.comparePassword(password);
    if (!isMatch) {
      await member.incLoginAttempts();
      return res.status(401).json({ error: messages.auth.invalidCredentials });
    }

    await member.resetLoginAttempts();

    const token = jwt.sign({ id: member.id, email: member.email }, JWT_SECRET, { expiresIn: '7d' });

    logger.info(`User logged in successfully: ${member.name} (${member.email})`);

    return res.json({
      token,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        avatar: member.avatar
      }
    });
  } catch (error) {
    logger.error('Login error: %o', error);
    return res.status(500).json({ error: messages.auth.loginError });
  }
});

// POST /api/auth/register
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { name, email, password, role, avatar } = req.body;

    const existingMember = await Member.findOne({ where: { email } });
    if (existingMember) {
      return res.status(400).json({ error: messages.auth.emailInUse });
    }

    const defaultAvatar = avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;

    const newMember = await Member.create({
      name,
      email,
      password,
      role: messages.auth.defaultRole,
      avatar: defaultAvatar
    });

    const token = jwt.sign({ id: newMember.id, email: newMember.email }, JWT_SECRET, { expiresIn: '7d' });

    logger.info(`New member registered: ${newMember.name} (${newMember.email})`);

    return res.status(201).json({
      token,
      member: {
        id: newMember.id,
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        avatar: newMember.avatar
      }
    });
  } catch (error) {
    logger.error('Registration error: %o', error);
    return res.status(500).json({ error: messages.auth.registerError });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  return res.json({
    member: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar
    }
  });
});

// PUT /api/auth/profile
router.put('/profile', authenticate, validateProfileUpdate, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    if (name !== undefined) req.user.name = name;
    if (avatar !== undefined) req.user.avatar = avatar;
    await req.user.save();
    
    logger.info(`Profile updated for user ${req.user.email}`);
    return res.json({
      member: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      }
    });
  } catch (error) {
    logger.error('Profile update error: %o', error);
    return res.status(500).json({ error: messages.auth.profileUpdateError });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authenticate, validateChangePassword, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: messages.auth.currentPasswordIncorrect });
    }

    req.user.password = newPassword;
    await req.user.save();

    logger.info(`Password changed for user ${req.user.email}`);
    return res.json({ message: messages.auth.passwordChangeSuccess });
  } catch (error) {
    logger.error('Change password error: %o', error);
    return res.status(500).json({ error: messages.auth.passwordChangeError });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', validateForgotPassword, async (req, res) => {
  try {
    const { email } = req.body;
    const member = await Member.findOne({ where: { email } });
    if (!member) {
      // For security, don't reveal if email exists or not
      return res.json({ message: messages.auth.forgotPasswordSent });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    member.resetPasswordToken = hashedToken;
    member.resetPasswordExpires = new Date(Date.now() + 3600000);
    await member.save();

    const resetUrl = `${req.headers.origin || 'http://localhost:5173'}/#/reset-password?token=${token}`;
    await sendPasswordResetEmail(member.email, member.name, resetUrl);

    logger.info(`Password reset link sent to ${email}`);
    return res.json({ message: messages.auth.forgotPasswordSent });
  } catch (error) {
    logger.error('Forgot password error: %o', error);
    return res.status(500).json({ error: messages.auth.forgotPasswordError });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', validateResetPassword, async (req, res) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const member = await Member.findOne({ where: { resetPasswordToken: hashedToken } });
    
    if (!member || !member.resetPasswordExpires || member.resetPasswordExpires < new Date()) {
      return res.status(400).json({ error: messages.auth.resetPasswordInvalid });
    }

    member.password = password;
    member.resetPasswordToken = null;
    member.resetPasswordExpires = null;
    await member.save();

    logger.info(`Password successfully reset for user ${member.email}`);
    return res.json({ message: messages.auth.resetPasswordSuccess });
  } catch (error) {
    logger.error('Reset password error: %o', error);
    return res.status(500).json({ error: messages.auth.resetPasswordError });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    logger.info(`User logged out: ${req.user.name} (${req.user.email})`);
    return res.json({ message: messages.auth.logoutSuccess });
  } catch (error) {
    logger.error('Logout error: %o', error);
    return res.status(500).json({ error: messages.auth.logoutError });
  }
});

module.exports = router;
