const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All analytics routes require authentication
router.use(authenticateToken);

// GET /api/analytics/dashboard - Get dashboard statistics
router.get('/dashboard', analyticsController.getDashboardStats);

// GET /api/analytics/trends?days=30 - Get completion trends
router.get('/trends', analyticsController.getCompletionTrends);

// GET /api/analytics/status-distribution - Get status distribution
router.get('/status-distribution', analyticsController.getStatusDistribution);

// GET /api/analytics/activity?limit=10 - Get recent activity feed
router.get('/activity', analyticsController.getActivityFeed);

module.exports = router;
