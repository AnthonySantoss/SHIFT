const { queryRun, queryAll } = require('../config/db');

class TripModel {
  static async create({ driverId, driverPlate, score, speedAvg, fatigueMax, distance, durationSeconds }) {
    const sql = `
      INSERT INTO trips (driver_id, driver_plate, score, speed_avg, fatigue_max, distance, duration_seconds)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await queryRun(sql, [
      driverId || null,
      driverPlate.toUpperCase().trim(),
      score,
      speedAvg,
      fatigueMax,
      distance,
      durationSeconds
    ]);
    return result.id;
  }

  static async getRecentByPlate(plate) {
    const sql = `SELECT * FROM trips WHERE UPPER(driver_plate) = UPPER(?) ORDER BY created_at DESC LIMIT 10`;
    return await queryAll(sql, [plate.trim()]);
  }
}

module.exports = TripModel;
