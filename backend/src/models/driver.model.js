const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Driver = sequelize.define('Driver', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  plate: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(value) {
      this.setDataValue('plate', value.toUpperCase().trim());
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  trips: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'good',
  },
  badges: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 5.0,
  }
}, {
  tableName: 'drivers',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Driver;
