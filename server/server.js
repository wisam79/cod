require('dotenv').config();
// Force Vercel to bundle pg and pg-hstore for Sequelize postgres dialect
require('pg');
require('pg-hstore');

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const { sequelize } = require('./models');
const logger = require('./utils/logger');
const messages = require('./utils/messages');
const { apiLimiter } = require('./middleware/rateLimiter');
const { initWebSocket } = require('./services/websocket');

// Route Imports
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const memberRoutes = require('./routes/members');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [];

const isLocalhost = (url) => {
  try {
    const hostname = new URL(url).hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch (e) {
    return false;
  }
};

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV !== 'production' || isLocalhost(origin) || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
app.use('/api/', apiLimiter);

// Body Parser
app.use(express.json());

// HTTP Parameter Pollution protection
app.use(hpp());

// Request Timeout middleware (15 seconds)
app.use((req, res, next) => {
  res.setTimeout(15000, () => {
    if (!res.headersSent) {
      res.status(408).json({ error: messages.server.requestTimeout });
    }
  });
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Database sync middleware for Vercel / serverless environment
let dbSynced = false;
app.use(async (req, res, next) => {
  if (!dbSynced) {
    try {
      await sequelize.authenticate();
      await sequelize.sync();
      dbSynced = true;
    } catch (err) {
      logger.error('Failed to sync DB in middleware: %o', err);
      return res.status(500).json({ error: 'حدث خطأ أثناء الاتصال بقاعدة البيانات.' });
    }
  }
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// Base / Health Check route
app.get('/api/health', (req, res) => {
  return res.json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'mohemmaty-backend'
  });
});

const path = require('path');

// Serve static frontend in production or on Glitch
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.PROJECT_DOMAIN;
if (isProduction) {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// 404 handler for API routes
app.use((req, res, next) => {
  res.status(404).json({ error: messages.server.routeNotFound });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  logger.error('Unhandled server error: %o', err);
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.PROJECT_DOMAIN;
  res.status(err.status || 500).json({
    error: isProd ? messages.server.unexpectedError : (err.message || messages.server.unexpectedError)
  });
});

// Create HTTP server
const server = http.createServer(app);
server.timeout = 15000; // 15 seconds timeout

// Initialize WebSocket server on the same HTTP server port
initWebSocket(server);

// Sync Database and Start Server
const startServer = async () => {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Sync database (without force to preserve seeded data)
    await sequelize.sync();
    logger.info('Database models synced.');

    // Start listening
    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`WebSocket server is running on the same port ws://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Unable to start the server: %o', error);
    process.exit(1);
  }
};

const isVercel = !!process.env.VERCEL;
if (process.env.NODE_ENV !== 'test' && !isVercel) {
  startServer();
}

module.exports = app;
