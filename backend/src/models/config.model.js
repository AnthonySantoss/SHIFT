const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AppConfig = sequelize.define('AppConfig', {
  key: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'app_config',
  timestamps: false, // Original table didn't have timestamps for config
});

module.exports = AppConfig;
