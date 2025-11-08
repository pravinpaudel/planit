const { AnalyticsService } = require('../service/analyticsService');

/**
 * Get dashboard statistics
 */
async function getDashboardStats(req, res) {
    try {
        const userId = req.user.id;
        const stats = await AnalyticsService.getDashboardStats(userId);
        res.status(200).json(stats);
    } catch (error) {
        console.error("Error in getDashboardStats:", error);
        res.status(400).json({ error: error.message });
    }
}

/**
 * Get completion trends over a specified period
 */
async function getCompletionTrends(req, res) {
    try {
        const userId = req.user.id;
        const days = parseInt(req.query.days) || 30;
        
        if (days < 1 || days > 365) {
            return res.status(400).json({ error: "Days must be between 1 and 365" });
        }

        const trends = await AnalyticsService.getCompletionTrends(userId, days);
        res.status(200).json(trends);
    } catch (error) {
        console.error("Error in getCompletionTrends:", error);
        res.status(400).json({ error: error.message });
    }
}

/**
 * Get milestone status distribution
 */
async function getStatusDistribution(req, res) {
    try {
        const userId = req.user.id;
        const distribution = await AnalyticsService.getStatusDistribution(userId);
        res.status(200).json(distribution);
    } catch (error) {
        console.error("Error in getStatusDistribution:", error);
        res.status(400).json({ error: error.message });
    }
}

/**
 * Get recent activity feed
 */
async function getActivityFeed(req, res) {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;
        
        if (limit < 1 || limit > 50) {
            return res.status(400).json({ error: "Limit must be between 1 and 50" });
        }

        const activities = await AnalyticsService.getActivityFeed(userId, limit);
        res.status(200).json(activities);
    } catch (error) {
        console.error("Error in getActivityFeed:", error);
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    getDashboardStats,
    getCompletionTrends,
    getStatusDistribution,
    getActivityFeed
};
