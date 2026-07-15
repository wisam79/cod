const jwt = require('jsonwebtoken');
const { Member } = require('../models');
const logger = require('../utils/logger');
const messages = require('../utils/messages');

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test_jwt_secret_key_123!' : null);
if (!JWT_SECRET) {
  logger.error('CRITICAL ERROR: JWT_SECRET environment variable is not set!');
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
