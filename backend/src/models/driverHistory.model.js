const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DriverHistory = sequelize.define('DriverHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  driver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  issue: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'driver_history',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = DriverHistory;
