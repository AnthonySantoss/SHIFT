const { queryAll, queryRun } = require('../config/db');

class CampaignModel {
  static async getChallenges(role) {
    if (role === 'admin') {
      const sql = `SELECT * FROM campaign_challenges ORDER BY id ASC`;
      return await queryAll(sql);
    }
    // Returns challenges restricting by role or applicable to all
    const sql = `
      SELECT * FROM campaign_challenges 
      WHERE role_restriction = ? OR role_restriction = 'all'
      ORDER BY id ASC
    `;
    return await queryAll(sql, [role]);
  }

  static async getTips() {
    const sql = `SELECT * FROM campaign_tips ORDER BY id ASC`;
    return await queryAll(sql);
  }

  static async getRewards() {
    const sql = `SELECT * FROM clube_rewards ORDER BY id ASC`;
    return await queryAll(sql);
  }

  static async createTip(title, subtitle, content, points) {
    const sql = `
      INSERT INTO campaign_tips (title, subtitle, content, points)
      VALUES (?, ?, ?, ?)
    `;
    return await queryRun(sql, [title, subtitle, content, parseInt(points)]);
  }

  static async deleteTip(id) {
    const sql = `DELETE FROM campaign_tips WHERE id = ?`;
    return await queryRun(sql, [id]);
  }

  static async createChallenge(title, description, points, role_restriction) {
    const sql = `
      INSERT INTO campaign_challenges (title, description, points, role_restriction)
      VALUES (?, ?, ?, ?)
    `;
    return await queryRun(sql, [title, description, points, role_restriction]);
  }

  static async deleteChallenge(id) {
    const sql = `DELETE FROM campaign_challenges WHERE id = ?`;
    return await queryRun(sql, [id]);
  }

  static async createReward(title, description, progress, color) {
    const sql = `
      INSERT INTO clube_rewards (title, description, progress, color)
      VALUES (?, ?, ?, ?)
    `;
    return await queryRun(sql, [title, description, progress, color]);
  }

  static async deleteReward(id) {
    const sql = `DELETE FROM clube_rewards WHERE id = ?`;
    return await queryRun(sql, [id]);
  }
}

module.exports = CampaignModel;
