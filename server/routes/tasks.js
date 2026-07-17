const express = require('express');
const { Task, Member, Comment, Notification, sequelize } = require('../models');
const { authenticate } = require('../middleware/auth');
const { broadcast } = require('../services/websocket');
const { sanitizeBody } = require('../middleware/sanitize');
const { validateTask, validateComment } = require('../middleware/validation');
const { canModifyTask } = require('../middleware/authorize');
const { getPagination } = require('../utils/pagination');
const logger = require('../utils/logger');
const messages = require('../utils/messages');

const router = express.Router();

const MEMBER_ATTRS = ['id', 'name', 'role', 'avatar'];

const sanitizeLikePattern = (str) => {
  return str.replace(/%/g, '\\%').replace(/_/g, '\\_');
};

const taskIncludes = () => [
  {
    model: Member,
    as: 'assignee',
    attributes: MEMBER_ATTRS
  },
  {
    model: Member,
    as: 'creator',
    attributes: MEMBER_ATTRS
  },
  {
    model: Comment,
    as: 'comments',
    include: [{
      model: Member,
      as: 'sender',
      attributes: MEMBER_ATTRS
    }]
  }
];

const checkMaxTasksLimit = async (memberId, targetStatus, taskIdToIgnore = null) => {
  if (!memberId || targetStatus === 'done') return true;
  const { Settings } = require('../models');
  const { Op } = require('sequelize');
  try {
    const maxTasksSetting = await Settings.findByPk('maxTasksPerUser');
    if (maxTasksSetting) {
      const maxTasks = parseInt(maxTasksSetting.value, 10);
      const whereClause = {
        assigneeId: memberId,
        status: { [Op.ne]: 'done' }
      };
      if (taskIdToIgnore) {
        whereClause.id = { [Op.ne]: taskIdToIgnore };
      }
      const activeCount = await Task.count({ where: whereClause });
      if (activeCount >= maxTasks) {
        return false;
      }
    }
  } catch (e) {
    logger.error('Error checking max tasks limit: %o', e);
  }
  return true;
};

// Apply auth middleware and sanitization to all task routes
router.use(authenticate);
router.use(sanitizeBody);

// GET /api/tasks - Retrieve all tasks with assignees and comments (including comment senders)
router.get('/', async (req, res) => {
  try {
    const { limit, offset } = getPagination(req.query);
    const { search, status, priority, assigneeId } = req.query;
    const { Op } = require('sequelize');

    const whereClause = {};

    if (search) {
      const isPostgres = sequelize.options.dialect === 'postgres';
      const likeOp = isPostgres ? Op.iLike : Op.like;
      whereClause[Op.or] = [
        { title: { [likeOp]: `%${sanitizeLikePattern(search)}%` } },
        { description: { [likeOp]: `%${sanitizeLikePattern(search)}%` } }
      ];
    }

    if (status) {
      whereClause.status = { [Op.in]: status.split(',') };
    }

    if (priority) {
      whereClause.priority = { [Op.in]: priority.split(',') };
    }

    if (assigneeId) {
      whereClause.assigneeId = assigneeId === 'null' ? null : assigneeId;
    }

    const queryOptions = {
      where: whereClause,
      include: taskIncludes(),
      order: [['createdAt', 'DESC']]
    };

    if (limit) queryOptions.limit = limit;
    if (offset !== null) queryOptions.offset = offset;

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
      include: taskIncludes()
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

    const hasCapacity = await checkMaxTasksLimit(assigneeId, status || 'todo');
    if (!hasCapacity) {
      return res.status(400).json({ 
        error: 'تعذر إسناد المهمة. تم بلوغ الحد الأقصى للمهام النشطة لهذا المستخدم.' 
      });
    }
  }

  let transaction;
  try {
    transaction = await sequelize.transaction();
    if (!transaction) {
      return res.status(500).json({ error: messages.tasks.createError });
    }
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
      include: taskIncludes()
    });

    logger.info(`[AUDIT] User ${req.user.name} (ID: ${req.user.id}) created task "${title}" (ID: ${task.id})`);

    // Broadcast through WebSocket
    broadcast('task_created', fullTask);
    broadcast('notification_created', notif);

    return res.status(201).json(fullTask);
  } catch (error) {
    if (transaction) await transaction.rollback();
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

  const targetAssigneeId = assigneeId !== undefined ? assigneeId : task.assigneeId;
  const targetStatus = status !== undefined ? status : task.status;
  
  if (targetAssigneeId) {
    const assigneeChanged = targetAssigneeId !== task.assigneeId;
    const statusBecameActive = targetStatus !== 'done' && task.status === 'done';
    
    if (assigneeChanged || statusBecameActive) {
      const hasCapacity = await checkMaxTasksLimit(targetAssigneeId, targetStatus, task.id);
      if (!hasCapacity) {
        return res.status(400).json({ 
          error: 'تعذر إسناد أو تحديث المهمة. تم بلوغ الحد الأقصى للمهام النشطة لهذا المستخدم.' 
        });
      }
    }
  }

  let transaction;
  try {
    transaction = await sequelize.transaction();
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
      include: taskIncludes()
    });

    logger.info(`Task updated: ID ${task.id} by ${req.user.name}`);

    // Broadcast WebSocket updates
    broadcast('task_updated', updatedTask);
    if (statusNotif) broadcast('notification_created', statusNotif);
    if (assignNotif) broadcast('notification_created', assignNotif);

    return res.json(updatedTask);
  } catch (error) {
    if (transaction) await transaction.rollback();
    logger.error('Error updating task: %o', error);
    return res.status(500).json({ error: messages.tasks.updateError });
  }
});

// DELETE /api/tasks/:id - Delete a task (transaction-safe)
router.delete('/:id', canModifyTask, async (req, res) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();
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
    if (transaction) await transaction.rollback();
    logger.error('Error deleting task: %o', error);
    return res.status(500).json({ error: messages.tasks.deleteError });
  }
});

// POST /api/tasks/:id/comments - Add comment to task (transaction-safe)
router.post('/:id/comments', validateComment, async (req, res) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();
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
    if (transaction) await transaction.rollback();
    logger.error('Error adding comment: %o', error);
    return res.status(500).json({ error: messages.tasks.commentAddError });
  }
});

// DELETE /api/tasks/:id/comments/:commentId - Delete comment (with ownership or admin check)
router.delete('/:id/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: messages.tasks.commentNotFound });
    }
    // Check ownership: ensure senderId matches req.user.id OR user is Super Admin
    const role = req.user.role || '';
    const isSuper = role.includes('الادمن المطور') || role.includes('Super Admin');
    if (comment.senderId !== req.user.id && !isSuper) {
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
