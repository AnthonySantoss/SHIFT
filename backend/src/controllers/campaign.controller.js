const CampaignModel = require('../models/campaign.model');

class CampaignController {
  static async getChallenges(req, res) {
    try {
      const { role } = req.user; // Injected by authMiddleware
      const challenges = await CampaignModel.getChallenges(role);
      return res.json(challenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      return res.status(500).json({ error: 'Erro ao carregar desafios.' });
    }
  }

  static async getTips(req, res) {
    try {
      const tips = await CampaignModel.getTips();
      return res.json(tips);
    } catch (error) {
      console.error('Error fetching tips:', error);
      return res.status(500).json({ error: 'Erro ao carregar dicas rápidas.' });
    }
  }

  static async getRewards(req, res) {
    try {
      const rewards = await CampaignModel.getRewards();
      return res.json(rewards);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      return res.status(500).json({ error: 'Erro ao carregar vantagens.' });
    }
  }
}

module.exports = CampaignController;
