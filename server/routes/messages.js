const express = require('express');
const { Message, Member, Notification, sequelize } = require('../models');
const { authenticate } = require('../middleware/auth');
const { broadcast } = require('../services/websocket');
const { sanitizeBody } = require('../middleware/sanitize');
const { validateMessage } = require('../middleware/validation');
const logger = require('../utils/logger');
const messages = require('../utils/messages');

const router = express.Router();

router.use(authenticate);
router.use(sanitizeBody);

// GET /api/messages - Retrieve message history
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const offset = page && limit ? (page - 1) * limit : null;

    const queryOptions = {
      include: [
        {
          model: Member,
          as: 'sender',
          attributes: ['id', 'name', 'role', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']]
    };

    if (limit) {
      queryOptions.limit = limit;
    }
    if (offset !== null) {
      queryOptions.offset = offset;
    }

    const messagesData = await Message.findAll(queryOptions);
    // Reverse to chronological order after fetching the most recent
    return res.json(messagesData.reverse());
  } catch (error) {
    logger.error('Error fetching messages: %o', error);
    return res.status(500).json({ error: messages.messages.fetchError });
  }
});

// POST /api/messages - Post a new message and broadcast it (transaction-safe)
router.post('/', validateMessage, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { text } = req.body;

    const isoTime = new Date().toISOString();
    const message = await Message.create({
      text,
      senderId: req.user.id,
      time: isoTime
    }, { transaction });

    // Create activity notification for chat (global, memberId is null)
    const abbreviatedText = text.substring(0, 20) + (text.length > 20 ? '...' : '');
    const notificationText = messages.dynamic.chatNotif(req.user.name, abbreviatedText);
    const notif = await Notification.create({
      text: notificationText,
      type: 'chat',
      time: isoTime,
      memberId: null
    }, { transaction });

    await transaction.commit();

    const fullMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: Member,
          as: 'sender',
          attributes: ['id', 'name', 'role', 'avatar']
        }
      ]
    });

    logger.info(`Message posted by ${req.user.name}: "${abbreviatedText}"`);

    // Broadcast messages & notifications
    broadcast('message_created', fullMessage);
    broadcast('notification_created', notif);

    return res.status(201).json(fullMessage);
  } catch (error) {
    await transaction.rollback();
    logger.error('Error saving message: %o', error);
    return res.status(500).json({ error: messages.messages.sendError });
  }
});

module.exports = router;
