const { queryGet, queryRun } = require('../config/db');

class UserModel {
  static async findByEmail(email) {
    const sql = `SELECT * FROM users WHERE LOWER(email) = LOWER(?)`;
    return await queryGet(sql, [email.trim()]);
  }

  static async findById(id) {
    const sql = `SELECT id, name, email, role, plate, bonus_points, created_at FROM users WHERE id = ?`;
    return await queryGet(sql, [id]);
  }

  static async create({ name, email, passwordHash, role, plate }) {
    const sql = `
      INSERT INTO users (name, email, password_hash, role, plate)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await queryRun(sql, [
      name.trim(),
      email.toLowerCase().trim(),
      passwordHash,
      role,
      plate ? plate.toUpperCase().trim() : null
    ]);
    return result.id;
  }

  static async addBonusPoints(id, points) {
    const sql = `UPDATE users SET bonus_points = bonus_points + ? WHERE id = ?`;
    return await queryRun(sql, [points, id]);
  }
}

module.exports = UserModel;
