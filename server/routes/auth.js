const express = require('express');
const jwt = require('jsonwebtoken');
const { Member } = require('../models');
const { JWT_SECRET, authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { sanitizeBody } = require('../middleware/sanitize');
const { validateRegister, validateLogin } = require('../middleware/validation');
const logger = require('../utils/logger');
const messages = require('../utils/messages');

const router = express.Router();

// Apply auth rate limiting and body sanitization
router.use(authLimiter);
router.use(sanitizeBody);

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    let { email, password } = req.body;

    const member = await Member.findOne({ where: { email } });
    if (!member) {
      return res.status(401).json({ error: messages.auth.invalidCredentials });
    }

    const isMatch = await member.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: messages.auth.invalidCredentials });
    }

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
      role: role || 'عضو جديد',
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

module.exports = router;
