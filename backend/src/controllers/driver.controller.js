const DriverModel = require('../models/driver.model');
const AuditModel = require('../models/audit.model');
const UserModel = require('../models/user.model');

class DriverController {
  static async searchDriver(req, res) {
    try {
      const { plate } = req.query;
      if (!plate) {
        return res.status(400).json({ error: 'A matrícula é obrigatória para a pesquisa.' });
      }

      const cleanPlate = plate.toUpperCase().trim();
      const driver = await DriverModel.findByPlate(cleanPlate);

      if (driver) {
        const history = await DriverModel.getHistory(driver.id);
        const audits = await DriverModel.getAudits(cleanPlate);
        
        return res.json({
          found: true,
          driver: {
            id: driver.id,
            plate: driver.plate,
            name: driver.name,
            score: driver.score,
            trips: driver.trips,
            status: driver.status,
            badges: driver.badges,
            rating: driver.rating
          },
          history,
          audits
        });
      } else {
        // Matrícula não encontrada no sistema, mas de acordo com os requisitos podemos iniciar auditorias
        return res.json({
          found: false,
          driver: {
            plate: cleanPlate,
            name: 'Motorista Novo',
            score: '--',
            trips: 0,
            status: 'unknown',
            badges: [],
            rating: 0
          },
          history: [],
          audits: []
        });
      }
    } catch (error) {
      console.error('Error searching driver:', error);
      return res.status(500).json({ error: 'Erro interno ao procurar o motorista.' });
    }
  }

  static async getSelfProfile(req, res) {
    try {
      const { id, role, plate, name } = req.user;

      if (role === 'passenger') {
        // -------------------------------------------------------------
        // PASSENGER AUTH PROFILE STATE
        // -------------------------------------------------------------
        const audits = await AuditModel.getRecentByPassenger(id);
        const totalAudits = audits.length;

        const feedbacks = [
          { label: 'Auditor Cidadão', count: totalAudits },
          { label: 'Pontos SHIFT', count: (totalAudits * 100) + (req.user.bonus_points || 0) },
          { label: 'Viagens Auditadas', count: totalAudits }
        ];

        return res.json({
          profile: {
            name: name,
            plate: 'Passageiro Cidadão',
            rating: 5.0,
            totalTrips: totalAudits,
            score: 100,
            feedbacks,
            recentTrips: audits.map((a) => ({
              id: a.id,
              date: new Date(a.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
              context: `Veículo: ${a.driver_plate}`,
              stars: a.rating_stars,
              feedback: a.feedback,
              score: a.score,
              issue: a.infractions.length > 0 ? a.infractions[0] : null
            }))
          }
        });
      }

      // -------------------------------------------------------------
      // DRIVER AUTH PROFILE STATE
      // -------------------------------------------------------------
      const selfPlate = plate || 'XYZ-1992';
      let driver = await DriverModel.findByPlate(selfPlate);

      if (!driver) {
        // Automatically spawn missing driver public catalog defensively
        await DriverModel.create(selfPlate, name, 100, 0, 'excellent', ['Novato'], 5.0);
        driver = await DriverModel.findByPlate(selfPlate);
      }

      const history = await DriverModel.getHistory(driver.id);
      const audits = await DriverModel.getAudits(selfPlate);

      // Extract passenger feedback highlights dynamically from public audits
      const feedbacks = [
        { label: 'Direção Suave', count: 0 },
        { label: 'Exigiu Cinto', count: 0 },
        { label: 'Muito Focado', count: 0 }
      ];

      audits.forEach(audit => {
        if (audit.positive_actions) {
          audit.positive_actions.forEach(action => {
            const match = feedbacks.find(f => f.label.toLowerCase() === action.toLowerCase() || (action.toLowerCase().includes('cinto') && f.label.includes('Cinto')) || (action.toLowerCase().includes('suave') && f.label.includes('Suave')) || (action.toLowerCase().includes('focado') && f.label.includes('Focado')));
            if (match) {
              match.count += 1;
            }
          });
        }
      });

      // Calculate dynamic average rating strictly from public SQLite audits
      const totalAuditsCount = audits.length;
      const sumStars = audits.reduce((acc, a) => acc + a.rating_stars, 0);
      const dynamicRating = totalAuditsCount > 0 ? parseFloat((sumStars / totalAuditsCount).toFixed(1)) : '--';

      // Dynamic Points computation relacional-style!
      feedbacks.push({
        label: 'Pontos SHIFT',
        count: (driver.trips * 150) + (req.user.bonus_points || 0)
      });

      return res.json({
        profile: {
          name: driver.name,
          plate: driver.plate,
          rating: dynamicRating,
          totalTrips: driver.trips,
          score: driver.score,
          feedbacks,
          recentTrips: audits.map((a) => ({
            id: a.id,
            date: new Date(a.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
            context: a.road_context + (a.weather_context !== 'limpo' ? ` (${a.weather_context})` : ''),
            stars: a.rating_stars,
            feedback: a.feedback,
            score: a.score,
            issue: a.infractions.length > 0 ? a.infractions[0] : null
          }))
        }
      });
    } catch (error) {
      console.error('Error fetching self profile:', error);
      return res.status(500).json({ error: 'Erro interno ao carregar perfil do motorista.' });
    }
  }

  static async addBonusPoints(req, res) {
    try {
      const { id } = req.user;
      const { points } = req.body;
      if (!points || typeof points !== 'number' || points <= 0) {
        return res.status(400).json({ error: 'Quantidade de pontos inválida.' });
      }

      await UserModel.addBonusPoints(id, points);
      return res.json({ success: true, message: `${points} pontos SHIFT adicionados com sucesso!` });
    } catch (error) {
      console.error('Error adding bonus points:', error);
      return res.status(500).json({ error: 'Erro interno ao adicionar pontos.' });
    }
  }
}

module.exports = DriverController;
