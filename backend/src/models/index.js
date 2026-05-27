const User = require('./user.model');
const Driver = require('./driver.model');
const DriverHistory = require('./driverHistory.model');
const Audit = require('./audit.model');
const Trip = require('./trip.model');
const { Challenge, Tip, Reward } = require('./campaign.model');
const AppConfig = require('./config.model');

// Associations
User.hasMany(Audit, { foreignKey: 'passenger_id', as: 'audits' });
Audit.belongsTo(User, { foreignKey: 'passenger_id', as: 'passenger' });

User.hasMany(Trip, { foreignKey: 'driver_id', as: 'trips' });
Trip.belongsTo(User, { foreignKey: 'driver_id', as: 'driver' });

Driver.hasMany(DriverHistory, { foreignKey: 'driver_id', as: 'history' });
DriverHistory.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver' });

module.exports = {
  User,
  Driver,
  DriverHistory,
  Audit,
  Trip,
  Challenge,
  Tip,
  Reward,
  AppConfig
};
