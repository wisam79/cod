/**
 * JWT authentication middleware.
 * Verifies Bearer tokens and attaches the authenticated user to req.user.
 * @module auth
 */
const jwt = require('jsonwebtoken');
const { Member } = require('../models');
const logger = require('../utils/logger');
const messages = require('../utils/messages');

const crypto = require('crypto');
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test_jwt_secret_key_123!' : crypto.randomBytes(64).toString('hex'));
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  logger.error('FATAL: JWT_SECRET environment variable is not set. Refusing to start.');
  process.exit(1);
}


const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: messages.auth.tokenMissing });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const member = await Member.findByPk(decoded.id);
    if (!member) {
      return res.status(401).json({ error: 'المستخدم غير موجود.' });
    }

    req.user = member;
    next();
  } catch (error) {
    logger.warn('Authentication failed: %s', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'TokenExpiredError', message: messages.auth.tokenExpired });
    }
    return res.status(401).json({ error: messages.auth.tokenInvalid });
  }
};

module.exports = {
  authenticate,
  JWT_SECRET
};
