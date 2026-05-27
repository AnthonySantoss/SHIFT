const { Driver, Audit, User, DriverHistory } = require('../models');

class DriverController {
  static async searchDriver(req, res) {
    try {
      const { plate } = req.query;
      if (!plate) {
        return res.status(400).json({ error: 'A matrícula é obrigatória para a pesquisa.' });
      }

      const cleanPlate = plate.toUpperCase().trim();
      const driver = await Driver.findOne({ where: { plate: cleanPlate } });

      if (driver) {
        const history = await DriverHistory.findAll({ 
          where: { driver_id: driver.id },
          order: [['id', 'DESC']]
        });
        const audits = await Audit.findAll({ 
          where: { driver_plate: cleanPlate },
          order: [['id', 'DESC']]
        });
        
        return res.json({
          found: true,
          driver: driver.toJSON(),
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
        const audits = await Audit.findAll({ 
          where: { passenger_id: id },
          order: [['id', 'DESC']]
        });
        const totalAudits = audits.length;

        const feedbacks = [
          { label: 'Auditor Cidadão', count: totalAudits },
          { label: 'Pontos SHIFT', count: (totalAudits * 100) + (req.user.bonus_points || 0) },
          { label: 'Viagens Auditadas', count: totalAudits }
        ];

        // Calculate passenger level
        const calculatePassLevel = (auditsCount) => {
          if (auditsCount >= 50) return { name: 'Auditor de Elite', next: 'Max' };
          if (auditsCount >= 20) return { name: 'Inspetor Sênior', next: 50 };
          if (auditsCount >= 10) return { name: 'Sentinela do Trânsito', next: 20 };
          if (auditsCount >= 5) return { name: 'Colaborador Ativo', next: 10 };
          return { name: 'Observador', next: 5 };
        };

        return res.json({
          profile: {
            name: name,
            plate: 'Passageiro Cidadão',
            rating: 5.0,
            totalTrips: totalAudits,
            score: 100,
            level: calculatePassLevel(totalAudits),
            badges: totalAudits >= 10 ? ['Olho de Águia'] : totalAudits >= 1 ? ['Primeira Auditoria'] : [],
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

      if (role === 'admin') {
        // -------------------------------------------------------------
        // ADMIN AUTH PROFILE STATE
        // -------------------------------------------------------------
        const feedbacks = [
          { label: 'Controle de Regras', count: 1 },
          { label: 'Gestão de Missões', count: 1 },
          { label: 'Clube SHIFT', count: 1 }
        ];

        return res.json({
          profile: {
            name: name,
            plate: 'Administrador Geral',
            rating: 5.0,
            totalTrips: 0,
            score: 100,
            feedbacks,
            recentTrips: []
          }
        });
      }

      // -------------------------------------------------------------
      // DRIVER AUTH PROFILE STATE
      // -------------------------------------------------------------
      const selfPlate = plate;
      if (!selfPlate) {
        return res.status(400).json({ error: 'Nenhum veículo registado para este motorista.' });
      }
      let driver = await Driver.findOne({ where: { plate: selfPlate } });

      if (!driver) {
        // Automatically spawn missing driver public catalog defensively
        driver = await Driver.create({
          plate: selfPlate,
          name,
          score: 100,
          trips: 0,
          status: 'excellent',
          badges: ['Novato'],
          rating: 5.0
        });
      }

      const history = await DriverHistory.findAll({ 
        where: { driver_id: driver.id },
        order: [['id', 'DESC']]
      });
      const audits = await Audit.findAll({ 
        where: { driver_plate: selfPlate },
        order: [['id', 'DESC']]
      });

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

      // Calculate dynamic average rating strictly from public audits
      const totalAuditsCount = audits.length;
      const sumStars = audits.reduce((acc, a) => acc + a.rating_stars, 0);
      const dynamicRating = totalAuditsCount > 0 ? parseFloat((sumStars / totalAuditsCount).toFixed(1)) : '--';

      // Dynamic Points computation relacional-style!
      feedbacks.push({
        label: 'Pontos SHIFT',
        count: (driver.trips * 150) + (req.user.bonus_points || 0)
      });

      // Calculate level based on trips
      const calculateLevel = (trips) => {
        if (trips >= 100) return { name: 'Lenda Urbana', next: 'Max' };
        if (trips >= 50) return { name: 'Mestre da Segurança', next: 100 };
        if (trips >= 25) return { name: 'Especialista', next: 50 };
        if (trips >= 10) return { name: 'Avançado', next: 25 };
        if (trips >= 3) return { name: 'Intermediário', next: 10 };
        return { name: 'Iniciante', next: 3 };
      };

      const levelInfo = calculateLevel(driver.trips);

      return res.json({
        profile: {
          name: driver.name,
          plate: driver.plate,
          rating: dynamicRating,
          totalTrips: driver.trips,
          score: driver.score,
          badges: driver.badges || [], // Include real badges
          level: levelInfo,
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

      const user = await User.findByPk(id);
      if (user) {
        user.bonus_points += points;
        await user.save();
      }
      
      return res.json({ success: true, message: `${points} pontos SHIFT adicionados com sucesso!` });
    } catch (error) {
      console.error('Error adding bonus points:', error);
      return res.status(500).json({ error: 'Erro interno ao adicionar pontos.' });
    }
  }

  static async getLeaderboard(req, res) {
    try {
      const topDrivers = await Driver.findAll({
        attributes: ['id', 'name', 'plate', 'score', 'trips', 'rating', 'badges'],
        order: [
          ['score', 'DESC'],
          ['trips', 'DESC']
        ],
        limit: 10
      });

      return res.json({ leaderboard: topDrivers });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return res.status(500).json({ error: 'Erro ao carregar ranking de motoristas.' });
    }
  }
}

module.exports = DriverController;
