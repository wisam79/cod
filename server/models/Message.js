const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Members',
      key: 'id'
    }
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  time: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Message;
