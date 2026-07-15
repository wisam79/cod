const { WebSocketServer, WebSocket } = require('ws');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const logger = require('../utils/logger');
const messages = require('../utils/messages');

let wss = null;

const initWebSocket = (server) => {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    logger.info('New WebSocket connection established.');

    // Parse query params to authenticate client
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');
    
    if (!token) {
      logger.warn('WebSocket connection attempt without token. Rejecting.');
      ws.send(JSON.stringify({ type: 'error', error: 'Unauthorized', message: messages.ws.unauthorized }));
      ws.close(4001, 'Unauthorized');
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      ws.userId = decoded.id;
      logger.info(`WebSocket connection authenticated for user ID: ${decoded.id}`);

      // Periodic token validity check (disconnect on expired/invalid token)
      const tokenCheckInterval = setInterval(() => {
        try {
          jwt.verify(token, JWT_SECRET);
        } catch (err) {
          logger.warn(`WebSocket connection closed via periodic token validation check for user ID: ${ws.userId}`);
          if (err.name === 'TokenExpiredError') {
            ws.send(JSON.stringify({ type: 'error', error: 'TokenExpiredError', message: messages.auth.tokenExpired }));
            ws.close(4002, 'TokenExpiredError');
          } else {
            ws.send(JSON.stringify({ type: 'error', error: 'Unauthorized', message: messages.auth.tokenInvalid }));
            ws.close(4001, 'Token Invalid or Expired');
          }
          clearInterval(tokenCheckInterval);
        }
      }, 10000); // Check every 10 seconds for responsiveness

      ws.on('close', () => {
        clearInterval(tokenCheckInterval);
      });
    } catch (err) {
      logger.warn('WebSocket connection token invalid: %s. Rejecting.', err.message);
      if (err.name === 'TokenExpiredError') {
        ws.send(JSON.stringify({ type: 'error', error: 'TokenExpiredError', message: messages.auth.tokenExpired }));
        ws.close(4002, 'TokenExpiredError');
      } else {
        ws.send(JSON.stringify({ type: 'error', error: 'Unauthorized', message: messages.auth.tokenInvalid }));
        ws.close(4001, 'Unauthorized');
      }
      return;
    }

    ws.on('message', (message) => {
      let data;
      try {
        data = JSON.parse(message);
        logger.debug('Received WebSocket message: %o', data);
      } catch (error) {
        logger.error('Error parsing client WebSocket message:', error);
        return; // Ignore malformed messages instead of crashing inner logic
      }
      
      // Handle incoming client messages if any
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    });

    ws.on('close', () => {
      logger.info('WebSocket connection closed.');
    });

    ws.on('error', (error) => {
      logger.error('WebSocket client connection error:', error);
    });

    // Send initial success state
    ws.send(JSON.stringify({ type: 'connected', message: messages.ws.welcome }));
  });

  return wss;
};

const broadcast = (type, payload) => {
  if (!wss) {
    logger.warn('WebSocket Server not initialized. Cannot broadcast.');
    return;
  }

  const messageStr = JSON.stringify({ type, payload });
  logger.info(`Broadcasting WebSocket event: ${type}`);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      if (payload && payload.memberId !== undefined && payload.memberId !== null) {
        if (client.userId !== payload.memberId) return; // Skip users not targeted by this event
      }
      client.send(messageStr);
    }
  });
};

module.exports = {
  initWebSocket,
  broadcast
};
