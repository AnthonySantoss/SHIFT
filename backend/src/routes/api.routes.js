const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/auth.controller');
const DriverController = require('../controllers/driver.controller');
const AuditController = require('../controllers/audit.controller');
const TripController = require('../controllers/trip.controller');
const CampaignController = require('../controllers/campaign.controller');
const AdminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

// Public Authentication endpoints
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);

// Public lookup endpoints
router.get('/drivers/search', DriverController.searchDriver);
router.get('/drivers/leaderboard', DriverController.getLeaderboard);

// Protected endpoints (Requires Authorization Token)
router.get('/drivers/self', authMiddleware, DriverController.getSelfProfile);
router.post('/audits', authMiddleware, AuditController.submitAudit);
router.post('/trips', authMiddleware, TripController.saveTrip);

// Campaign & Clube Rewards Protected endpoints
router.get('/campaign/challenges', authMiddleware, CampaignController.getChallenges);
router.get('/campaign/tips', authMiddleware, CampaignController.getTips);
router.get('/clube/rewards', authMiddleware, CampaignController.getRewards);
router.post('/clube/points', authMiddleware, DriverController.addBonusPoints);
router.get('/config', authMiddleware, AdminController.getConfigs);

// Admin-Only Protected endpoints (Requires JWT + Admin Role)
router.get('/admin/config', authMiddleware, adminMiddleware, AdminController.getConfigs);
router.put('/admin/config', authMiddleware, adminMiddleware, AdminController.updateConfig);
router.post('/admin/challenges', authMiddleware, adminMiddleware, AdminController.createChallenge);
router.delete('/admin/challenges/:id', authMiddleware, adminMiddleware, AdminController.deleteChallenge);
router.post('/admin/rewards', authMiddleware, adminMiddleware, AdminController.createReward);
router.delete('/admin/rewards/:id', authMiddleware, adminMiddleware, AdminController.deleteReward);
router.post('/admin/tips', authMiddleware, adminMiddleware, AdminController.createTip);
router.delete('/admin/tips/:id', authMiddleware, adminMiddleware, AdminController.deleteTip);

// Hotspots & Safety Zones
router.get('/hotspots', AuditController.getHotspots);

module.exports = router;
