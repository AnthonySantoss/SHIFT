const ConfigModel = require('../models/config.model');
const CampaignModel = require('../models/campaign.model');

class AdminController {
  static async getConfigs(req, res) {
    try {
      const configs = await ConfigModel.getAll();
      return res.json(configs);
    } catch (error) {
      console.error('Error fetching admin configs:', error);
      return res.status(500).json({ error: 'Erro ao carregar configurações.' });
    }
  }

  static async updateConfig(req, res) {
    try {
      const { key, value } = req.body;
      if (!key || value === undefined) {
        return res.status(400).json({ error: 'Parâmetros key e value obrigatórios.' });
      }
      const updated = await ConfigModel.update(key, value);
      return res.json(updated);
    } catch (error) {
      console.error('Error updating admin config:', error);
      return res.status(500).json({ error: 'Erro ao guardar configuração.' });
    }
  }

  static async createChallenge(req, res) {
    try {
      const { title, description, points, role_restriction } = req.body;
      if (!title || !description || !points || !role_restriction) {
        return res.status(400).json({ error: 'Campos incompletos para criar missão.' });
      }
      const result = await CampaignModel.createChallenge(title, description, parseInt(points), role_restriction);
      return res.json({ id: result.id, title, description, points, role_restriction });
    } catch (error) {
      console.error('Error creating challenge:', error);
      return res.status(500).json({ error: 'Erro ao registar missão.' });
    }
  }

  static async deleteChallenge(req, res) {
    try {
      const { id } = req.params;
      await CampaignModel.deleteChallenge(id);
      return res.json({ success: true, message: 'Missão removida com sucesso.' });
    } catch (error) {
      console.error('Error deleting challenge:', error);
      return res.status(500).json({ error: 'Erro ao remover missão.' });
    }
  }

  static async createReward(req, res) {
    try {
      const { title, description, progress, color } = req.body;
      if (!title || !description || progress === undefined || !color) {
        return res.status(400).json({ error: 'Campos incompletos para criar vantagem.' });
      }
      const result = await CampaignModel.createReward(title, description, parseInt(progress), color);
      return res.json({ id: result.id, title, description, progress, color });
    } catch (error) {
      console.error('Error creating reward:', error);
      return res.status(500).json({ error: 'Erro ao registar vantagem.' });
    }
  }

  static async deleteReward(req, res) {
    try {
      const { id } = req.params;
      await CampaignModel.deleteReward(id);
      return res.json({ success: true, message: 'Vantagem removida com sucesso.' });
    } catch (error) {
      console.error('Error deleting reward:', error);
      return res.status(500).json({ error: 'Erro ao remover vantagem.' });
    }
  }

  static async createTip(req, res) {
    try {
      const { title, points } = req.body;
      if (!title || points === undefined) {
        return res.status(400).json({ error: 'Campos incompletos para criar dica rápida.' });
      }
      const result = await CampaignModel.createTip(title, parseInt(points));
      return res.json({ id: result.id, title, points });
    } catch (error) {
      console.error('Error creating tip:', error);
      return res.status(500).json({ error: 'Erro ao registar dica rápida.' });
    }
  }

  static async deleteTip(req, res) {
    try {
      const { id } = req.params;
      await CampaignModel.deleteTip(id);
      return res.json({ success: true, message: 'Dica rápida removida com sucesso.' });
    } catch (error) {
      console.error('Error deleting tip:', error);
      return res.status(500).json({ error: 'Erro ao remover dica rápida.' });
    }
  }
}

module.exports = AdminController;
