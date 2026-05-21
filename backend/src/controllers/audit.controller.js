const AuditModel = require('../models/audit.model');
const DriverModel = require('../models/driver.model');

class AuditController {
  static async submitAudit(req, res) {
    try {
      const { driverPlate, roadContext, weatherContext, score, ratingStars, positiveActions, infractions, feedback } = req.body;

      if (!driverPlate) {
        return res.status(400).json({ error: 'A matrícula do veículo é obrigatória.' });
      }
      if (!ratingStars || ratingStars < 1 || ratingStars > 5) {
        return res.status(400).json({ error: 'A nota final em estrelas (1 a 5) é obrigatória.' });
      }

      const cleanPlate = driverPlate.toUpperCase().trim();

      // Check if driver exists, if not create a new driver record
      let driver = await DriverModel.findByPlate(cleanPlate);
      if (!driver) {
        // Registering new driver dynamically when first audited
        const name = `Motorista ${cleanPlate}`;
        await DriverModel.create(cleanPlate, name, 100, 0, 'good', [], 5.0);
        driver = await DriverModel.findByPlate(cleanPlate);
      }

      // Save audit log
      const auditId = await AuditModel.create({
        passengerId: req.user ? req.user.id : null,
        driverPlate: cleanPlate,
        roadContext: roadContext || 'urbana',
        weatherContext: weatherContext || 'limpo',
        score: score !== undefined ? score : 100,
        ratingStars,
        positiveActions: positiveActions || [],
        infractions: infractions || [],
        feedback: feedback || ''
      });

      // Recalculate and update the driver's profile score and rating (Real-time dynamic data update!)
      const updatedMetrics = await DriverModel.updateScoreAndRating(cleanPlate, score !== undefined ? score : 100, ratingStars);

      // Create a driver history entry for safety audits (optional but nice)
      // Since it's dynamic, we could insert a driver_history entry too!
      // This ensures when you search the plate, you see this audit in their history list immediately!
      const sqlite3 = require('sqlite3').verbose();
      const path = require('path');
      const dbPath = path.join(__dirname, '..', 'database', 'db.sqlite');
      const db = new sqlite3.Database(dbPath);
      
      const issueString = infractions && infractions.length > 0 ? infractions.join(', ') : null;
      const statusText = score > 80 ? 'perfect' : score > 60 ? 'good' : 'danger';
      const durationText = 'Corrida Auditada';
      const dateText = 'Hoje, ' + new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

      db.run(
        `INSERT INTO driver_history (driver_id, date, score, duration, status, issue) VALUES (?, ?, ?, ?, ?, ?)`,
        [driver.id, dateText, score, durationText, statusText, issueString],
        function(err) {
          if (err) console.error('Error logging history entry:', err);
          db.close();
        }
      );

      return res.status(201).json({
        message: 'Auditoria enviada e processada com sucesso!',
        auditId,
        updatedMetrics
      });
    } catch (error) {
      console.error('Error submitting audit:', error);
      return res.status(500).json({ error: 'Erro interno ao submeter a auditoria.' });
    }
  }
}

module.exports = AuditController;
