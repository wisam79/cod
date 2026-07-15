const messages = require('../utils/messages');

const isString = (val) => typeof val === 'string';

const validateRegister = (req, res, next) => {
  const { name, email, password, avatar } = req.body;
  if (!isString(name) || name.trim().length < 2) {
    return res.status(400).json({ error: messages.validation.nameLength });
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!isString(email) || !emailRegex.test(email)) {
    return res.status(400).json({ error: messages.validation.emailInvalid });
  }
  if (!isString(password) || password.length < 8) {
    return res.status(400).json({ error: messages.validation.passwordLength });
  }
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>\-_=+]/.test(password);
  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    return res.status(400).json({ error: messages.validation.passwordStrength });
  }
  if (avatar) {
    if (!isString(avatar)) {
      return res.status(400).json({ error: messages.validation.avatarText });
    }
    try {
      new URL(avatar);
    } catch (e) {
      return res.status(400).json({ error: messages.validation.avatarInvalid });
    }
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!isString(email) || !emailRegex.test(email)) {
    return res.status(400).json({ error: messages.validation.emailInvalid });
  }
  if (!isString(password) || password.trim().length === 0) {
    return res.status(400).json({ error: messages.validation.passwordRequired });
  }
  next();
};

const validateTask = (req, res, next) => {
  const { title, status, priority, dueDate } = req.body;
  if (req.method === 'POST' && (!isString(title) || title.trim().length < 2)) {
    return res.status(400).json({ error: messages.validation.taskTitleRequired });
  }
  if (title !== undefined && (!isString(title) || title.trim().length < 2)) {
    return res.status(400).json({ error: messages.validation.taskTitleLength });
  }
  if (status && !['todo', 'progress', 'review', 'done'].includes(status)) {
    return res.status(400).json({ error: messages.validation.taskStatusInvalid });
  }
  if (priority && !['low', 'medium', 'high'].includes(priority)) {
    return res.status(400).json({ error: messages.validation.taskPriorityInvalid });
  }
  if (dueDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isString(dueDate) || !dateRegex.test(dueDate) || isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ error: messages.validation.taskDueDateInvalid });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dueDate);
    if (selectedDate < today) {
      return res.status(400).json({ error: messages.validation.taskDueDateFuture });
    }
  }
  next();
};

const validateMessage = (req, res, next) => {
  const { text } = req.body;
  if (!isString(text) || text.trim().length === 0) {
    return res.status(400).json({ error: messages.validation.messageTextRequired });
  }
  if (text.length > 1000) {
    return res.status(400).json({ error: messages.validation.messageTooLong });
  }
  next();
};

const validateComment = (req, res, next) => {
  const { text } = req.body;
  if (!isString(text)) {
    return res.status(400).json({ error: messages.validation.commentTextString });
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return res.status(400).json({ error: messages.validation.commentTextRequired });
  }
  // Extra sanitization check for empty HTML-only comments
  const noHtml = trimmed.replace(/<[^>]*>/g, '').trim();
  if (noHtml.length === 0) {
    return res.status(400).json({ error: messages.validation.commentTextRequired });
  }
  if (text.length > 1000) {
    return res.status(400).json({ error: messages.validation.commentTooLong });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateTask,
  validateMessage,
  validateComment
};
