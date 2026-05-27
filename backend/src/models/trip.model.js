const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Trip = sequelize.define('Trip', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  driver_id: {
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
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  speed_avg: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  fatigue_max: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  distance: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  duration_seconds: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  tableName: 'trips',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Trip;
