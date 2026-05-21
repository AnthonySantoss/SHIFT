const { queryGet, queryAll, queryRun } = require('../config/db');

class DriverModel {
  static async findByPlate(plate) {
    // Exact plate matching (utilizes unique index on plate)
    const sql = `SELECT * FROM drivers WHERE UPPER(plate) = UPPER(?)`;
    const driver = await queryGet(sql, [plate.trim()]);
    if (driver && typeof driver.badges === 'string') {
      try {
        driver.badges = JSON.parse(driver.badges);
      } catch (e) {
        driver.badges = [];
      }
    }
    return driver;
  }

  static async create(plate, name, score = 100, trips = 0, status = 'good', badges = [], rating = 5.0) {
    const sql = `
      INSERT INTO drivers (plate, name, score, trips, status, badges, rating)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await queryRun(sql, [
      plate.toUpperCase().trim(),
      name,
      score,
      trips,
      status,
      JSON.stringify(badges),
      rating
    ]);
    return result.id;
  }

  static async getHistory(driverId) {
    // Returns driver history (utilizes index on driver_id)
    const sql = `SELECT * FROM driver_history WHERE driver_id = ? ORDER BY id DESC`;
    return await queryAll(sql, [driverId]);
  }

  static async getAudits(plate) {
    // Returns passenger audits (utilizes composite index on driver_plate, created_at DESC)
    const sql = `SELECT * FROM audits WHERE UPPER(driver_plate) = UPPER(?) ORDER BY created_at DESC`;
    const audits = await queryAll(sql, [plate.trim()]);
    return audits.map(audit => {
      try {
        audit.positive_actions = JSON.parse(audit.positive_actions);
      } catch (e) {
        audit.positive_actions = [];
      }
      try {
        audit.infractions = JSON.parse(audit.infractions);
      } catch (e) {
        audit.infractions = [];
      }
      return audit;
    });
  }

  static async updateScoreAndRating(plate, newScore, newRatingStars) {
    const driver = await this.findByPlate(plate);
    if (!driver) return null;

    // Calculate moving average for rating and total trips
    const updatedTrips = driver.trips + 1;
    const updatedRating = parseFloat(
      ((driver.rating * driver.trips + newRatingStars) / updatedTrips).toFixed(1)
    );
    
    // Simple average score logic
    const updatedScore = Math.max(0, Math.min(100, Math.round((driver.score * driver.trips + newScore) / updatedTrips)));

    // Set new status based on score
    let updatedStatus = 'good';
    if (updatedScore > 90) updatedStatus = 'excellent';
    else if (updatedScore < 60) updatedStatus = 'danger';

    const sql = `
      UPDATE drivers 
      SET score = ?, trips = ?, status = ?, rating = ? 
      WHERE id = ?
    `;
    await queryRun(sql, [updatedScore, updatedTrips, updatedStatus, updatedRating, driver.id]);
    return {
      score: updatedScore,
      trips: updatedTrips,
      status: updatedStatus,
      rating: updatedRating
    };
  }
}

module.exports = DriverModel;
