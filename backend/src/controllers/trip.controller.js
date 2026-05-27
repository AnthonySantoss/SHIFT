const { Trip, Driver } = require('../models');
const { awardBadges } = require('../utils/badgeHelper');
const { tripSchema } = require('../utils/validation');

class TripController {
  static async saveTrip(req, res) {
    try {
      // 1. Validate Schema
      const validation = tripSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Dados de telemetria inválidos.', 
          details: validation.error.format() 
        });
      }

      const { score, speedAvg, fatigueMax, distance, durationSeconds, latitude, longitude } = validation.data;
      const selfPlate = req.user.plate;
      const selfId = req.user.id;

      if (!selfPlate && req.user.role === 'driver') {
        return res.status(400).json({ error: 'Nenhum veículo registado para este motorista.' });
      }

      const trip = await Trip.create({
        driver_id: selfId,
        driver_plate: selfPlate,
        score: score !== undefined ? score : 90,
        speed_avg: speedAvg || 0,
        fatigue_max: fatigueMax || 0,
        distance: distance || 0,
        duration_seconds: durationSeconds || 0,
        latitude,
        longitude
      });

      // Update the logged-in driver's general statistics: increment trip count and average out the score
      const driver = await Driver.findOne({ where: { plate: selfPlate } });
      if (driver) {
        // Average score update
        const updatedTripsCount = driver.trips + 1;
        const currentScore = score !== undefined ? score : 90;
        const updatedScore = Math.max(0, Math.min(100, Math.round((driver.score * driver.trips + currentScore) / updatedTripsCount)));
        
        let updatedStatus = 'good';
        if (updatedScore > 90) updatedStatus = 'excellent';
        else if (updatedScore < 60) updatedStatus = 'danger';

        const updatedBadges = awardBadges(driver, { score: currentScore, distance });

        await driver.update({
          trips: updatedTripsCount,
          score: updatedScore,
          status: updatedStatus,
          badges: updatedBadges
        });
      }

      return res.status(201).json({
        message: 'Viagem guardada com sucesso!',
        tripId: trip.id
      });
    } catch (error) {
      console.error('Error saving trip:', error);
      return res.status(500).json({ error: 'Erro interno ao guardar a viagem.' });
    }
  }
}

module.exports = TripController;
