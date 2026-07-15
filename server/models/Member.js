const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Member = sequelize.define('Member', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: async (member) => {
      if (member.password) {
        const salt = await bcrypt.genSalt(10);
        member.password = await bcrypt.hash(member.password, salt);
      }
    },
    beforeUpdate: async (member) => {
      if (member.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        member.password = await bcrypt.hash(member.password, salt);
      }
    }
  }
});

Member.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = Member;
