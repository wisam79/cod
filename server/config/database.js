const { Sequelize } = require('sequelize');
const path = require('path');
const logger = require('../utils/logger');

const isTest = process.env.NODE_ENV === 'test';
const isGlitch = !!process.env.PROJECT_DOMAIN;
const hasDbUrl = !!process.env.DATABASE_URL;

let sequelize;

if (hasDbUrl && !isTest) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      }
    },
    logging: (msg) => logger.debug(msg),
    define: {
      timestamps: true
    }
  });
} else {
  const storagePath = isTest 
    ? ':memory:' 
    : isGlitch 
      ? path.join(__dirname, '../../.data/database.sqlite')
      : path.join(__dirname, '../database.sqlite');

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: isTest ? false : (msg) => logger.debug(msg),
    define: {
      timestamps: true
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    transactionType: 'IMMEDIATE'
  });
}

module.exports = sequelize;
