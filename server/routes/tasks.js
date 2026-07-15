const express = require('express');
const { Task, Member, Comment, Notification, sequelize } = require('../models');
const { authenticate } = require('../middleware/auth');
const { broadcast } = require('../services/websocket');
const { sanitizeBody } = require('../middleware/sanitize');
const { validateTask, validateComment } = require('../middleware/validation');
const { canModifyTask } = require('../middleware/authorize');
const logger = require('../utils/logger');
const messages = require('../utils/messages');

const router = express.Router();

// Apply auth middleware and sanitization to all task routes
router.use(authenticate);
router.use(sanitizeBody);

// GET /api/tasks - Retrieve all tasks with assignees and comments (including comment senders)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const offset = page && limit ? (page - 1) * limit : null;

    const queryOptions = {
      include: [
        {
          model: Member,
          as: 'assignee',
          attributes: ['id', 'name', 'role', 'avatar']
        },
        {
          model: Member,
          as: 'creator',
          attributes: ['id', 'name', 'role', 'avatar']
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: Member,
              as: 'sender',
              attributes: ['id', 'name', 'role', 'avatar']
            }
          ]
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

    const tasks = await Task.findAll(queryOptions);
    return res.json(tasks);
  } catch (error) {
    logger.error('Error fetching tasks: %o', error);
    return res.status(500).json({ error: messages.tasks.fetchError });
  }
});

// GET /api/tasks/:id - Get specific task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        {
          model: Member,
          as: 'assignee',
          attributes: ['id', 'name', 'role', 'avatar']
        },
        {
          model: Member,
          as: 'creator',
          attributes: ['id', 'name', 'role', 'avatar']
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: Member,
              as: 'sender',
              attributes: ['id', 'name', 'role', 'avatar']
            }
          ]
        }
      ]
    });

    if (!task) {
      return res.status(404).json({ error: messages.tasks.notFound });
    }

    return res.json(task);
  } catch (error) {
    logger.error('Error fetching task details: %o', error);
    return res.status(500).json({ error: messages.tasks.fetchDetailsError });
  }
});

// POST /api/tasks - Create a new task (transaction-safe)
router.post('/', validateTask, async (req, res) => {
  const { title, description, priority, status, dueDate, assigneeId } = req.body;

  let assigneeMember = null;
  if (assigneeId) {
    assigneeMember = await Member.findByPk(assigneeId);
    if (!assigneeMember) {
      return res.status(400).json({ error: messages.tasks.assigneeNotFound });
    }
  }

  const transaction = await sequelize.transaction();
  try {
    const task = await Task.create({
      title,
      description,
      priority: priority || 'medium',
      status: status || 'todo',
      dueDate,
      assigneeId: assigneeId || null,
      creatorId: req.user.id
    }, { transaction });

    // Generate notification
    const assigneeName = assigneeMember ? assigneeMember.name : 'غير محدد';
    const isoTime = new Date().toISOString();
    const notificationText = messages.dynamic.assignmentNotif(req.user.name, title, assigneeName);
    
    const notif = await Notification.create({
      text: notificationText,
      type: 'assignment',
      time: isoTime,
      memberId: assigneeId || null
    }, { transaction });

    await transaction.commit();

    // Fetch the task again with assignee info to send via websocket
    const fullTask = await Task.findByPk(task.id, {
      include: [
        {
          model: Member,
          as: 'assignee',
          attributes: ['id', 'name', 'role', 'avatar']
        },
        {
          model: Member,
          as: 'creator',
          attributes: ['id', 'name', 'role', 'avatar']
        },
        {
          model: Comment,
          as: 'comments',
          defaultValue: []
        }
      ]
    });

    logger.info(`[AUDIT] User ${req.user.name} (ID: ${req.user.id}) created task "${title}" (ID: ${task.id})`);

    // Broadcast through WebSocket
    broadcast('task_created', fullTask);
    broadcast('notification_created', notif);

    return res.status(201).json(fullTask);
  } catch (error) {
    await transaction.rollback();
    logger.error('Error creating task: %o', error);
    return res.status(500).json({ error: messages.tasks.createError });
  }
});

// PUT /api/tasks/:id - Update task (including status updates) (transaction-safe)
router.put('/:id', canModifyTask, validateTask, async (req, res) => {
  const { title, description, priority, status, dueDate, assigneeId } = req.body;
  const task = req.task; // Already loaded by canModifyTask middleware

  let assigneeMember = null;
  if (assigneeId) {
    assigneeMember = await Member.findByPk(assigneeId);
    if (!assigneeMember) {
      return res.status(400).json({ error: messages.tasks.assigneeNotFound });
    }
  }

  const transaction = await sequelize.transaction();
  try {
    const previousStatus = task.status;
    const previousAssigneeId = task.assigneeId;

    await task.update({
      title: title !== undefined ? title : task.title,
      description: description !== undefined ? description : task.description,
      priority: priority !== undefined ? priority : task.priority,
      status: status !== undefined ? status : task.status,
      dueDate: dueDate !== undefined ? dueDate : task.dueDate,
      assigneeId: assigneeId !== undefined ? assigneeId : task.assigneeId
    }, { transaction });

    const isoTime = new Date().toISOString();
    let statusNotif = null;
    let assignNotif = null;

    // Check if status changed
    if (status && status !== previousStatus) {
      const statusLabels = { todo: 'في الانتظار', progress: 'قيد العمل', review: 'قيد المراجعة', done: 'مكتملة' };
      const statusLabel = statusLabels[status] || status;
      const notificationText = messages.dynamic.statusNotif(task.title, statusLabel);
      
      statusNotif = await Notification.create({
        text: notificationText,
        type: 'status',
        time: isoTime,
        memberId: task.assigneeId || task.creatorId || null
      }, { transaction });
    }

    // Check if assignee changed
    if (assigneeId !== undefined && assigneeId !== previousAssigneeId) {
      const assigneeName = assigneeMember ? assigneeMember.name : 'غير محدد';
      const notificationText = messages.dynamic.assignNotif(task.title, assigneeName);
      
      assignNotif = await Notification.create({
        text: notificationText,
        type: 'assignment',
        time: isoTime,
        memberId: assigneeId || null
      }, { transaction });
    }

    await transaction.commit();

    // Fetch the updated task with relationships for broadcasting
    const updatedTask = await Task.findByPk(task.id, {
      include: [
        {
          model: Member,
          as: 'assignee',
          attributes: ['id', 'name', 'role', 'avatar']
        },
        {
          model: Member,
          as: 'creator',
          attributes: ['id', 'name', 'role', 'avatar']
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: Member,
              as: 'sender',
              attributes: ['id', 'name', 'role', 'avatar']
            }
          ]
        }
      ]
    });

    logger.info(`Task updated: ID ${task.id} by ${req.user.name}`);

    // Broadcast WebSocket updates
    broadcast('task_updated', updatedTask);
    if (statusNotif) broadcast('notification_created', statusNotif);
    if (assignNotif) broadcast('notification_created', assignNotif);

    return res.json(updatedTask);
  } catch (error) {
    await transaction.rollback();
    logger.error('Error updating task: %o', error);
    return res.status(500).json({ error: messages.tasks.updateError });
  }
});

// DELETE /api/tasks/:id - Delete a task (transaction-safe)
router.delete('/:id', canModifyTask, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const task = req.task; // Already loaded by canModifyTask middleware
    const title = task.title;
    const assigneeId = task.assigneeId;

    await task.destroy({ transaction });

    const isoTime = new Date().toISOString();
    const notificationText = messages.dynamic.deleteNotif(req.user.name, title);
    
    const notif = await Notification.create({
      text: notificationText,
      type: 'system',
      time: isoTime,
      memberId: assigneeId || null
    }, { transaction });

    await transaction.commit();

    logger.info(`[AUDIT] User ${req.user.name} (ID: ${req.user.id}) deleted task "${title}" (ID: ${task.id})`);

    // Broadcast WebSocket updates
    broadcast('task_deleted', { id: parseInt(req.params.id) });
    broadcast('notification_created', notif);

    return res.json({ message: messages.tasks.deleteSuccess });
  } catch (error) {
    await transaction.rollback();
    logger.error('Error deleting task: %o', error);
    return res.status(500).json({ error: messages.tasks.deleteError });
  }
});

// POST /api/tasks/:id/comments - Add comment to task (transaction-safe)
router.post('/:id/comments', validateComment, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { text } = req.body;
    const taskId = req.params.id;

    const task = await Task.findByPk(taskId, { transaction });
    if (!task) {
      await transaction.rollback();
      return res.status(404).json({ error: messages.tasks.notFound });
    }

    const isoTime = new Date().toISOString();
    const comment = await Comment.create({
      text,
      taskId: parseInt(taskId),
      senderId: req.user.id,
      time: isoTime
    }, { transaction });

    // Create notification
    const notificationText = messages.dynamic.commentNotif(req.user.name, task.title);
    const notif = await Notification.create({
      text: notificationText,
      type: 'comment',
      time: isoTime,
      memberId: task.assigneeId || task.creatorId || null
    }, { transaction });

    await transaction.commit();

    // Fetch comment with sender details
    const fullComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: Member,
          as: 'sender',
          attributes: ['id', 'name', 'role', 'avatar']
        }
      ]
    });

    logger.info(`Comment added on task "${task.title}" by ${req.user.name}`);

    // Broadcast WebSocket updates
    broadcast('comment_created', { taskId: parseInt(taskId), comment: fullComment });
    broadcast('notification_created', notif);

    return res.status(201).json(fullComment);
  } catch (error) {
    await transaction.rollback();
    logger.error('Error adding comment: %o', error);
    return res.status(500).json({ error: messages.tasks.commentAddError });
  }
});

// DELETE /api/tasks/comments/:commentId - Delete comment (with ownership check)
router.delete('/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: messages.tasks.commentNotFound });
    }
    // Check ownership: ensure senderId matches req.user.id
    if (comment.senderId !== req.user.id) {
      return res.status(403).json({ error: messages.tasks.commentDeleteUnauthorized });
    }
    await comment.destroy();
    broadcast('comment_deleted', { commentId: parseInt(commentId) });
    return res.json({ message: messages.tasks.commentDeleteSuccess });
  } catch (error) {
    logger.error('Error deleting comment: %o', error);
    return res.status(500).json({ error: messages.tasks.commentDeleteError });
  }
});

// DELETE /api/tasks/:id/comments/:commentId - Delete comment (alternative route format, with ownership check)
router.delete('/:id/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: messages.tasks.commentNotFound });
    }
    // Check ownership: ensure senderId matches req.user.id
    if (comment.senderId !== req.user.id) {
      return res.status(403).json({ error: messages.tasks.commentDeleteUnauthorized });
    }
    await comment.destroy();
    broadcast('comment_deleted', { taskId: parseInt(req.params.id), commentId: parseInt(commentId) });
    return res.json({ message: messages.tasks.commentDeleteSuccess });
  } catch (error) {
    logger.error('Error deleting comment: %o', error);
    return res.status(500).json({ error: messages.tasks.commentDeleteError });
  }
});

module.exports = router;
