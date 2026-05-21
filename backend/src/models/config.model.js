const { queryAll, queryRun } = require('../config/db');

class ConfigModel {
  static async getAll() {
    const sql = `SELECT * FROM app_config ORDER BY key ASC`;
    return await queryAll(sql);
  }

  static async getByKey(key) {
    const sql = `SELECT * FROM app_config WHERE key = ?`;
    const results = await queryAll(sql, [key]);
    return results[0] || null;
  }

  static async update(key, value) {
    const sql = `UPDATE app_config SET value = ? WHERE key = ?`;
    await queryRun(sql, [String(value), key]);
    return { key, value };
  }
}

module.exports = ConfigModel;
