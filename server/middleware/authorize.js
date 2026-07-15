const { Task } = require('../models');
const logger = require('../utils/logger');

const canModifyTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({ error: 'المهمة غير موجودة.' });
    }

    const user = req.user;
    const isManager = user.role && (user.role.includes('مدير') || user.role.includes('مديرة') || user.role.includes('Manager'));
    const isCreator = task.creatorId === user.id;
    const isAssignee = task.assigneeId === user.id;

    // Attach task to request so routes don't need to fetch it again
    req.task = task;

    // Managers or Creators can perform any action (PUT/DELETE)
    if (isManager || isCreator) {
      return next();
    }

    // Assignees can ONLY update the status field via PUT, not delete or edit other task fields
    if (req.method === 'PUT' && isAssignee) {
      const keys = Object.keys(req.body);
      // Filter out key if it's the only one updated, or allow update if it only contains status
      const invalidFields = keys.filter(key => key !== 'status');
      if (invalidFields.length > 0) {
        return res.status(403).json({ error: 'ليس لديك صلاحية لتعديل تفاصيل المهمة. يمكنك فقط تحديث حالتها.' });
      }
      return next();
    }

    return res.status(403).json({ error: 'غير مصرح لك بإجراء هذه العملية على المهمة.' });
  } catch (error) {
    logger.error('Authorization middleware error: %o', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء التحقق من الصلاحيات.' });
  }
};

module.exports = { canModifyTask };
