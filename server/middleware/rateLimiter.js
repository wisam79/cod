const rateLimit = require('express-rate-limit');

const isTest = process.env.NODE_ENV === 'test';
const isProd = process.env.NODE_ENV === 'production';

// Standard API Rate Limiter (Active in dev and prod, bypassed in tests)
const apiLimiter = isTest ? (req, res, next) => next() : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 150 : 1000, // Limit each IP to 150 requests in prod, 1000 in dev
  standardHeaders: true, 
  legacyHeaders: false, 
  message: {
    error: 'لقد تجاوزت الحد المسموح به من الطلبات. يرجى المحاولة مرة أخرى بعد 15 دقيقة.'
  }
});

// Stricter Limiter for Authentication (Active in dev and prod, bypassed in tests)
const authLimiter = isTest ? (req, res, next) => next() : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 5 : 20, // Limit each IP to 5 auth requests in prod, 20 in dev
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'عدد محاولات تسجيل الدخول كثيرة جداً. يرجى المحاولة بعد 15 دقيقة.'
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};
