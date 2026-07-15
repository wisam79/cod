const express = require('express');
const { Notification } = require('../models');
const { authenticate } = require('../middleware/auth');
const { broadcast } = require('../services/websocket');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const messages = require('../utils/messages');

const router = express.Router();

router.use(authenticate);

// GET /api/notifications - Get user-specific and global notifications
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const offset = page && limit ? (page - 1) * limit : null;

    const queryOptions = {
      where: {
        [Op.or]: [
          { memberId: null },
          { memberId: req.user.id }
        ]
      },
      order: [['createdAt', 'DESC']]
    };

    if (limit) {
      queryOptions.limit = limit;
    }
    if (offset !== null) {
      queryOptions.offset = offset;
    }

    const notifications = await Notification.findAll(queryOptions);
    return res.json(notifications);
  } catch (error) {
    logger.error('Error fetching notifications: %o', error);
    return res.status(500).json({ error: messages.notifications.fetchError });
  }
});

// DELETE /api/notifications - Clear user-specific notifications
router.delete('/', async (req, res) => {
  try {
    // Clear only user-specific notifications
    await Notification.destroy({ 
      where: { 
        memberId: req.user.id 
      } 
    });
    
    // Create new system notification for clearance (directed only to this user)
    const isoTime = new Date().toISOString();
    const notificationText = messages.notifications.clearSuccessNotif;
    
    const notif = await Notification.create({
      text: notificationText,
      type: 'system',
      time: isoTime,
      memberId: req.user.id
    });

    logger.info(`Notification history cleared by ${req.user.name}`);

    // Broadcast clear event and the new notification (but client handles clearing locally)
    broadcast('notifications_cleared', { userId: req.user.id });
    broadcast('notification_created', notif);

    return res.json({ message: messages.notifications.clearSuccessRes, notif });
  } catch (error) {
    logger.error('Error clearing notifications: %o', error);
    return res.status(500).json({ error: messages.notifications.clearError });
  }
});

module.exports = router;
