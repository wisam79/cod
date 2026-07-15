const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('assignment', 'status', 'system', 'chat', 'comment'),
    allowNull: false,
    defaultValue: 'system'
  },
  time: {
    type: DataTypes.STRING,
    allowNull: true
  },
  memberId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Members',
      key: 'id'
    }
  }
});

module.exports = Notification;
