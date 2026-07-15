const express = require('express');
const { Member } = require('../models');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');
const messages = require('../utils/messages');

const router = express.Router();

router.use(authenticate);

// GET /api/members
router.get('/', async (req, res) => {
  try {
    const members = await Member.findAll({
      attributes: ['id', 'name', 'email', 'role', 'avatar']
    });
    return res.json(members);
  } catch (error) {
    logger.error('Error fetching members: %o', error);
    return res.status(500).json({ error: messages.members.fetchError });
  }
});

// PUT /api/members/:id/role - Edit a member's role (with audit logging)
router.put('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const member = await Member.findByPk(id);
    if (!member) {
      return res.status(404).json({ error: 'العضو غير موجود.' });
    }
    const oldRole = member.role;
    await member.update({ role });
    logger.info(`[AUDIT] User ${req.user.name} (ID: ${req.user.id}) changed role of member ${member.name} (ID: ${member.id}) from "${oldRole}" to "${role}"`);
    return res.json({ message: 'تم تحديث الدور بنجاح.', member });
  } catch (error) {
    logger.error('Error updating member role: %o', error);
    return res.status(500).json({ error: 'حدث خطأ في الخادم أثناء تحديث الدور.' });
  }
});

module.exports = router;
