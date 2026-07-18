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
      isFiveLetters(value) {
        if (!/^[\u0600-\u06FFa-zA-Z]{5}$/.test(value)) {
          throw new Error('Username must be exactly 5 letters.');
        }
      }
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
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  emailVerificationToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  lockUntil: {
    type: DataTypes.DATE,
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

Member.prototype.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

Member.prototype.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.update({ loginAttempts: 1, lockUntil: null });
  }
  const newAttempts = this.loginAttempts + 1;
  const lockUpdates = { loginAttempts: newAttempts };
  if (newAttempts >= 5 && !this.isLocked()) {
    lockUpdates.lockUntil = Date.now() + 15 * 60 * 1000;
  }
  return this.update(lockUpdates);
};

Member.prototype.resetLoginAttempts = async function () {
  return this.update({ loginAttempts: 0, lockUntil: null });
};

module.exports = Member;
