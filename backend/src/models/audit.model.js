const { queryRun, queryAll } = require('../config/db');

class AuditModel {
  static async create({ passengerId, driverPlate, roadContext, weatherContext, score, ratingStars, positiveActions = [], infractions = [], feedback = '' }) {
    const sql = `
      INSERT INTO audits (passenger_id, driver_plate, road_context, weather_context, score, rating_stars, positive_actions, infractions, feedback)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await queryRun(sql, [
      passengerId || null,
      driverPlate.toUpperCase().trim(),
      roadContext,
      weatherContext,
      score,
      ratingStars,
      JSON.stringify(positiveActions),
      JSON.stringify(infractions),
      feedback
    ]);
    return result.id;
  }

  static async getRecentByPlate(plate) {
    const sql = `SELECT * FROM audits WHERE UPPER(driver_plate) = UPPER(?) ORDER BY created_at DESC LIMIT 5`;
    const rows = await queryAll(sql, [plate.trim()]);
    return rows.map(r => {
      try {
        r.positive_actions = JSON.parse(r.positive_actions);
      } catch (e) {
        r.positive_actions = [];
      }
      try {
        r.infractions = JSON.parse(r.infractions);
      } catch (e) {
        r.infractions = [];
      }
      return r;
    });
  }

  static async getRecentByPassenger(passengerId) {
    const sql = `SELECT * FROM audits WHERE passenger_id = ? ORDER BY created_at DESC LIMIT 10`;
    const rows = await queryAll(sql, [passengerId]);
    return rows.map(r => {
      try {
        r.positive_actions = JSON.parse(r.positive_actions);
      } catch (e) {
        r.positive_actions = [];
      }
      try {
        r.infractions = JSON.parse(r.infractions);
      } catch (e) {
        r.infractions = [];
      }
      return r;
    });
  }
}

module.exports = AuditModel;

