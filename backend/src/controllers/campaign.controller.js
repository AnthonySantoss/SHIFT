const { Op } = require('sequelize');
const { Challenge, Tip, Reward, Audit, Driver } = require('../models');

class CampaignController {
  static async getChallenges(req, res) {
    try {
      const { role } = req.user;
      const challenges = await Challenge.findAll({
        where: {
          role_restriction: {
            [Op.in]: [role, 'all']
          }
        }
      });
      return res.json(challenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      return res.status(500).json({ error: 'Erro ao carregar desafios.' });
    }
  }

  static async getTips(req, res) {
    try {
      const tips = await Tip.findAll();
      return res.json(tips);
    } catch (error) {
      console.error('Error fetching tips:', error);
      return res.status(500).json({ error: 'Erro ao carregar dicas rápidas.' });
    }
  }

  static async getRewards(req, res) {
    try {
      const { id, role, plate } = req.user; // Injected by authMiddleware
      let totalTripsOrAudits = 0;

      if (role === 'passenger') {
        const audits = await Audit.findAll({ where: { passenger_id: id } });
        totalTripsOrAudits = audits.length;
      } else if (role === 'admin') {
        totalTripsOrAudits = 0;
      } else {
        const driver = await Driver.findOne({ where: { plate: plate || 'XYZ-1992' } });
        if (driver) {
          totalTripsOrAudits = driver.trips;
        }
      }

      const rewards = await Reward.findAll();

      const updatedRewards = rewards.map(reward => {
        const meta = reward.toJSON();
        const t = meta.title.toLowerCase();
        let progress = 0;

        if (totalTripsOrAudits > 0) {
          if (t.includes('combustível')) {
            progress = Math.min(85, totalTripsOrAudits * 12);
          } else if (t.includes('vip') || t.includes('prioridade')) {
            progress = Math.min(100, totalTripsOrAudits * 10);
          } else if (t.includes('lavagem')) {
            progress = Math.min(60, totalTripsOrAudits * 12);
          } else {
            progress = Math.min(100, totalTripsOrAudits * 15);
          }
        }

        return {
          ...meta,
          progress: progress >= 100 ? 100 : progress,
          completed: progress >= 100 ? 1 : meta.completed
        };
      });

      return res.json(updatedRewards);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      return res.status(500).json({ error: 'Erro ao carregar vantagens.' });
    }
  }
}

module.exports = CampaignController;
