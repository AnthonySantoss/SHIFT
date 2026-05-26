const TripModel = require('../models/trip.model');
const DriverModel = require('../models/driver.model');

class TripController {
  static async saveTrip(req, res) {
    try {
      const { score, speedAvg, fatigueMax, distance, durationSeconds } = req.body;
      const selfPlate = req.user.plate;
      const selfId = req.user.id;

      if (!selfPlate && req.user.role === 'driver') {
        return res.status(400).json({ error: 'Nenhum veículo registado para este motorista.' });
      }

      const tripId = await TripModel.create({
        driverId: selfId,
        driverPlate: selfPlate,
        score: score !== undefined ? score : 90,
        speedAvg: speedAvg || 0,
        fatigueMax: fatigueMax || 0,
        distance: distance || 0,
        durationSeconds: durationSeconds || 0
      });

      // Update the logged-in driver's general statistics: increment trip count and average out the score
      const driver = await DriverModel.findByPlate(selfPlate);
      if (driver) {
        // Average score update
        const updatedTrips = driver.trips + 1;
        const updatedScore = Math.max(0, Math.min(100, Math.round((driver.score * driver.trips + score) / updatedTrips)));
        let updatedStatus = 'good';
        if (updatedScore > 90) updatedStatus = 'excellent';
        else if (updatedScore < 60) updatedStatus = 'danger';

        const sqlite3 = require('sqlite3').verbose();
        const path = require('path');
        const dbPath = path.join(__dirname, '..', 'database', 'db.sqlite');
        const db = new sqlite3.Database(dbPath);
        db.run(
          `UPDATE drivers SET trips = ?, score = ?, status = ? WHERE id = ?`,
          [updatedTrips, updatedScore, updatedStatus, driver.id],
          function(err) {
            db.close();
          }
        );
      }

      return res.status(201).json({
        message: 'Viagem guardada com sucesso!',
        tripId
      });
    } catch (error) {
      console.error('Error saving trip:', error);
      return res.status(500).json({ error: 'Erro interno ao guardar a viagem.' });
    }
  }
}

module.exports = TripController;
