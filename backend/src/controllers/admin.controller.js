const { AppConfig, Challenge, Tip, Reward } = require('../models');

class AdminController {
  static async getConfigs(req, res) {
    try {
      const configs = await AppConfig.findAll();
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
      
      let config = await AppConfig.findOne({ where: { key } });
      if (config) {
        config.value = value;
        await config.save();
      } else {
        config = await AppConfig.create({ key, value });
      }
      
      return res.json(config);
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
      const challenge = await Challenge.create({
        title,
        description,
        points: parseInt(points),
        role_restriction
      });
      return res.json(challenge);
    } catch (error) {
      console.error('Error creating challenge:', error);
      return res.status(500).json({ error: 'Erro ao registar missão.' });
    }
  }

  static async deleteChallenge(req, res) {
    try {
      const { id } = req.params;
      await Challenge.destroy({ where: { id } });
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
      const reward = await Reward.create({
        title,
        description,
        progress: parseInt(progress),
        color
      });
      return res.json(reward);
    } catch (error) {
      console.error('Error creating reward:', error);
      return res.status(500).json({ error: 'Erro ao registar vantagem.' });
    }
  }

  static async deleteReward(req, res) {
    try {
      const { id } = req.params;
      await Reward.destroy({ where: { id } });
      return res.json({ success: true, message: 'Vantagem removida com sucesso.' });
    } catch (error) {
      console.error('Error deleting reward:', error);
      return res.status(500).json({ error: 'Erro ao remover vantagem.' });
    }
  }

  static async createTip(req, res) {
    try {
      const { title, subtitle, content, points } = req.body;
      if (!title || points === undefined) {
        return res.status(400).json({ error: 'Campos incompletos para criar dica rápida.' });
      }
      const finalSubtitle = subtitle || 'Condução Defensiva';
      const finalContent = content || 'Mantenha foco na pista e atenção aos peões e outros motoristas.';
      
      const tip = await Tip.create({
        title,
        subtitle: finalSubtitle,
        content: finalContent,
        points: parseInt(points)
      });
      return res.json(tip);
    } catch (error) {
      console.error('Error creating tip:', error);
      return res.status(500).json({ error: 'Erro ao registar dica rápida.' });
    }
  }

  static async deleteTip(req, res) {
    try {
      const { id } = req.params;
      await Tip.destroy({ where: { id } });
      return res.json({ success: true, message: 'Dica rápida removida com sucesso.' });
    } catch (error) {
      console.error('Error deleting tip:', error);
      return res.status(500).json({ error: 'Erro ao remover dica rápida.' });
    }
  }
}

module.exports = AdminController;
