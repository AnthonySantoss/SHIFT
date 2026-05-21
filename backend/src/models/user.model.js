const { queryGet, queryRun } = require('../config/db');

class UserModel {
  static async findByEmail(email) {
    const sql = `SELECT * FROM users WHERE LOWER(email) = LOWER(?)`;
    return await queryGet(sql, [email.trim()]);
  }

  static async findById(id) {
    const sql = `SELECT id, name, email, role, plate, created_at FROM users WHERE id = ?`;
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
}

module.exports = UserModel;
