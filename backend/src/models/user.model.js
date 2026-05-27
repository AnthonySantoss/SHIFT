const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(value) {
      this.setDataValue('email', value.toLowerCase().trim());
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('driver', 'passenger', 'admin'),
    allowNull: false,
  },
  plate: {
    type: DataTypes.STRING,
    allowNull: true,
    set(value) {
      if (value) {
        this.setDataValue('plate', value.toUpperCase().trim());
      } else {
        this.setDataValue('plate', null);
      }
    }
  },
  bonus_points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  tableName: 'users',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = User;
