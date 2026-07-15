const sequelize = require('../config/database');
const Member = require('./Member');
const Task = require('./Task');
const Comment = require('./Comment');
const Message = require('./Message');
const Notification = require('./Notification');

// Member - Task Relationship (Assignee)
Member.hasMany(Task, { foreignKey: 'assigneeId', as: 'tasks' });
Task.belongsTo(Member, { as: 'assignee', foreignKey: 'assigneeId' });

// Member - Task Relationship (Creator)
Member.hasMany(Task, { foreignKey: 'creatorId', as: 'createdTasks' });
Task.belongsTo(Member, { as: 'creator', foreignKey: 'creatorId' });

// Task - Comment Relationship
Task.hasMany(Comment, { foreignKey: 'taskId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Task, { foreignKey: 'taskId' });

// Member - Comment Relationship
Member.hasMany(Comment, { foreignKey: 'senderId', as: 'comments' });
Comment.belongsTo(Member, { as: 'sender', foreignKey: 'senderId' });

// Member - Message Relationship
Member.hasMany(Message, { foreignKey: 'senderId', as: 'messages' });
Message.belongsTo(Member, { as: 'sender', foreignKey: 'senderId' });

// Member - Notification Relationship (Optional assignee/recipient)
Member.hasMany(Notification, { foreignKey: 'memberId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(Member, { foreignKey: 'memberId' });

module.exports = {
  sequelize,
  Member,
  Task,
  Comment,
  Message,
  Notification
};
