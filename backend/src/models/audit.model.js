const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Audit = sequelize.define('Audit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  passenger_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  driver_plate: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      this.setDataValue('driver_plate', value.toUpperCase().trim());
    }
  },
  road_context: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  weather_context: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rating_stars: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  positive_actions: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  infractions: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  }
}, {
  tableName: 'audits',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Audit;
