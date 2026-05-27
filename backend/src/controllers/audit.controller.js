const { Audit, Driver, DriverHistory } = require('../models');
const { awardBadges } = require('../utils/badgeHelper');
const { auditSchema } = require('../utils/validation');

class AuditController {
  static async submitAudit(req, res) {
    try {
      // 1. Validate Schema
      const validation = auditSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Dados da auditoria inválidos.', 
          details: validation.error.format() 
        });
      }

      const { 
        driverPlate, 
        roadContext, 
        weatherContext, 
        score, 
        ratingStars, 
        positiveActions, 
        infractions, 
        feedback,
        latitude,
        longitude
      } = validation.data;

      const cleanPlate = driverPlate.toUpperCase().trim();

      // Check if driver exists, if not create a new driver record
      let driver = await Driver.findOne({ where: { plate: cleanPlate } });
      if (!driver) {
        // Registering new driver dynamically when first audited
        const name = `Motorista ${cleanPlate}`;
        driver = await Driver.create({
          plate: cleanPlate,
          name,
          score: 100,
          trips: 0,
          status: 'good',
          badges: [],
          rating: 5.0
        });
      }

      // Save audit log
      const auditScore = score !== undefined ? score : 100;
      const audit = await Audit.create({
        passenger_id: req.user ? req.user.id : null,
        driver_plate: cleanPlate,
        road_context: roadContext || 'urbana',
        weather_context: weatherContext || 'limpo',
        score: auditScore,
        rating_stars: ratingStars,
        positive_actions: positiveActions || [],
        infractions: infractions || [],
        feedback: feedback || '',
        latitude,
        longitude
      });

      // Recalculate and update the driver's profile score and rating
      const audits = await Audit.findAll({ where: { driver_plate: cleanPlate } });
      const totalAuditsCount = audits.length;
      const sumStars = audits.reduce((acc, a) => acc + a.rating_stars, 0);
      const avgRating = parseFloat((sumStars / totalAuditsCount).toFixed(1));
      
      const sumScores = audits.reduce((acc, a) => acc + a.score, 0);
      const avgScore = Math.round(sumScores / totalAuditsCount);

      let updatedStatus = 'good';
      if (avgScore > 90) updatedStatus = 'excellent';
      else if (avgScore < 60) updatedStatus = 'danger';

      const updatedBadges = awardBadges(driver, null, { score: auditScore, ratingStars });

      await driver.update({
        rating: avgRating,
        score: avgScore,
        status: updatedStatus,
        badges: updatedBadges
      });

      // Create a driver history entry
      const issueString = infractions && infractions.length > 0 ? infractions.join(', ') : null;
      const statusText = auditScore > 80 ? 'perfect' : auditScore > 60 ? 'good' : 'danger';
      const durationText = 'Corrida Auditada';
      const dateText = 'Hoje, ' + new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

      await DriverHistory.create({
        driver_id: driver.id,
        date: dateText,
        score: auditScore,
        duration: durationText,
        status: statusText,
        issue: issueString
      });

      return res.status(201).json({
        message: 'Auditoria enviada e processada com sucesso!',
        auditId: audit.id,
        updatedMetrics: {
          rating: avgRating,
          score: avgScore
        }
      });
    } catch (error) {
      console.error('Error submitting audit:', error);
      return res.status(500).json({ error: 'Erro interno ao submeter a auditoria.' });
    }
  }

  static async getHotspots(req, res) {
    try {
      // Fetch audits that have infractions and coordinates
      const audits = await Audit.findAll({
        where: {
          latitude: { [require('sequelize').Op.ne]: null },
          longitude: { [require('sequelize').Op.ne]: null }
        },
        attributes: ['latitude', 'longitude', 'infractions', 'score'],
        order: [['created_at', 'DESC']],
        limit: 100
      });

      // Filter only those with actual infractions
      const hotspots = audits
        .filter(a => a.infractions && a.infractions.length > 0)
        .map(a => ({
          lat: a.latitude,
          lng: a.longitude,
          infractions: a.infractions,
          riskLevel: a.score < 60 ? 'high' : 'medium'
        }));

      return res.json({ hotspots });
    } catch (error) {
      console.error('Error fetching hotspots:', error);
      return res.status(500).json({ error: 'Erro ao buscar zonas de risco.' });
    }
  }
}

module.exports = AuditController;
