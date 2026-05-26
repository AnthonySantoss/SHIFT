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
      const { id, role, plate } = req.user; // Injected by authMiddleware
      let totalTripsOrAudits = 0;

      if (role === 'passenger') {
        const AuditModel = require('../models/audit.model');
        const audits = await AuditModel.getRecentByPassenger(id);
        totalTripsOrAudits = audits.length;
      } else if (role === 'admin') {
        totalTripsOrAudits = 0;
      } else {
        const DriverModel = require('../models/driver.model');
        const driver = await DriverModel.findByPlate(plate || 'XYZ-1992');
        if (driver) {
          totalTripsOrAudits = driver.trips;
        }
      }

      const rewards = await CampaignModel.getRewards();

      const updatedRewards = rewards.map(meta => {
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
