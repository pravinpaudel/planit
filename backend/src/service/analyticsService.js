const { prismaClient } = require('../utils/db');

class AnalyticsService {
    /**
     * Get dashboard statistics for a user
     * @param {string} userId - The user ID
     * @returns {Promise<Object>} Dashboard statistics
     */
    static async getDashboardStats(userId) {
        if (!userId) {
            throw new Error("User ID is required");
        }

        try {
            // Get all user tasks with milestones
            const tasks = await prismaClient.task.findMany({
                where: { userId },
                include: {
                    milestones: {
                        include: {
                            children: true
                        }
                    }
                }
            });

            // Flatten all milestones from all tasks
            const allMilestones = this.flattenMilestones(
                tasks.flatMap(task => task.milestones)
            );

            // Calculate statistics
            const totalPlans = tasks.length;
            const totalMilestones = allMilestones.length;
            
            // Count milestones by status
            const completedMilestones = allMilestones.filter(
                m => m.status === 'COMPLETED'
            ).length;
            const inProgressMilestones = allMilestones.filter(
                m => m.status === 'IN_PROGRESS'
            ).length;
            const notStartedMilestones = allMilestones.filter(
                m => m.status === 'NOT_STARTED'
            ).length;
            const atRiskMilestones = allMilestones.filter(
                m => m.status === 'AT_RISK'
            ).length;
            const delayedMilestones = allMilestones.filter(
                m => m.status === 'DELAYED'
            ).length;

            // Calculate active plans (plans with incomplete milestones)
            const activePlans = tasks.filter(task => {
                const taskMilestones = this.flattenMilestones(task.milestones);
                return taskMilestones.some(m => m.status !== 'COMPLETED');
            }).length;

            // Calculate completed plans (100% milestone completion)
            const completedPlans = tasks.filter(task => {
                const taskMilestones = this.flattenMilestones(task.milestones);
                return taskMilestones.length > 0 && 
                       taskMilestones.every(m => m.status === 'COMPLETED');
            }).length;

            // Calculate completion rate
            const completionRate = totalMilestones > 0 
                ? Math.round((completedMilestones / totalMilestones) * 100) 
                : 0;

            // Get upcoming milestones (not completed, with deadline, sorted by date)
            const upcomingMilestones = allMilestones
                .filter(m => m.status !== 'COMPLETED' && m.deadline)
                .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                .slice(0, 10); // Top 10 upcoming

            // Get milestones due today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const dueToday = allMilestones.filter(m => {
                if (!m.deadline || m.status === 'COMPLETED') return false;
                const deadline = new Date(m.deadline);
                deadline.setHours(0, 0, 0, 0);
                return deadline >= today && deadline < tomorrow;
            }).length;

            // Get milestones due this week
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() + 7);
            const dueThisWeek = allMilestones.filter(m => {
                if (!m.deadline || m.status === 'COMPLETED') return false;
                const deadline = new Date(m.deadline);
                return deadline >= today && deadline <= weekEnd;
            }).length;

            // Get overdue milestones
            const overdueMilestones = allMilestones.filter(m => {
                if (!m.deadline || m.status === 'COMPLETED') return false;
                return new Date(m.deadline) < today;
            }).length;

            return {
                totalPlans,
                activePlans,
                completedPlans,
                totalMilestones,
                completedMilestones,
                inProgressMilestones,
                notStartedMilestones,
                atRiskMilestones,
                delayedMilestones,
                completionRate,
                dueToday,
                dueThisWeek,
                overdueMilestones,
                upcomingMilestones: upcomingMilestones.map(m => ({
                    id: m.id,
                    title: m.title,
                    description: m.description,
                    status: m.status,
                    deadline: m.deadline,
                    taskId: m.taskId
                }))
            };
        } catch (error) {
            console.error("Error getting dashboard stats:", error);
            throw new Error("Error getting dashboard stats: " + error.message);
        }
    }

    /**
     * Get completion trends over a period
     * @param {string} userId - The user ID
     * @param {number} days - Number of days to look back (default: 30)
     * @returns {Promise<Array>} Daily completion data
     */
    static async getCompletionTrends(userId, days = 30) {
        if (!userId) {
            throw new Error("User ID is required");
        }

        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            startDate.setHours(0, 0, 0, 0);

            // Get all milestones for the user
            const tasks = await prismaClient.task.findMany({
                where: { userId },
                include: {
                    milestones: {
                        include: {
                            children: true
                        }
                    }
                }
            });

            const allMilestones = this.flattenMilestones(
                tasks.flatMap(task => task.milestones)
            );

            // Create a map of dates to completion counts
            const trendMap = new Map();
            const dateArray = [];

            // Initialize all dates in range
            for (let i = 0; i < days; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                trendMap.set(dateStr, { completed: 0, total: 0 });
                dateArray.push(dateStr);
            }

            // Count milestones updated to COMPLETED status on each day
            allMilestones.forEach(milestone => {
                const updatedDate = new Date(milestone.updatedAt);
                updatedDate.setHours(0, 0, 0, 0);
                
                if (updatedDate >= startDate) {
                    const dateStr = updatedDate.toISOString().split('T')[0];
                    if (trendMap.has(dateStr)) {
                        const data = trendMap.get(dateStr);
                        if (milestone.status === 'COMPLETED') {
                            data.completed++;
                        }
                        data.total++;
                    }
                }
            });

            // Convert to array format
            return dateArray.map(date => ({
                date,
                completed: trendMap.get(date).completed,
                total: trendMap.get(date).total
            }));
        } catch (error) {
            console.error("Error getting completion trends:", error);
            throw new Error("Error getting completion trends: " + error.message);
        }
    }

    /**
     * Get milestone status distribution
     * @param {string} userId - The user ID
     * @returns {Promise<Object>} Status distribution
     */
    static async getStatusDistribution(userId) {
        if (!userId) {
            throw new Error("User ID is required");
        }

        try {
            const tasks = await prismaClient.task.findMany({
                where: { userId },
                include: {
                    milestones: {
                        include: {
                            children: true
                        }
                    }
                }
            });

            const allMilestones = this.flattenMilestones(
                tasks.flatMap(task => task.milestones)
            );

            const distribution = {
                NOT_STARTED: 0,
                IN_PROGRESS: 0,
                COMPLETED: 0,
                AT_RISK: 0,
                DELAYED: 0
            };

            allMilestones.forEach(milestone => {
                if (distribution.hasOwnProperty(milestone.status)) {
                    distribution[milestone.status]++;
                }
            });

            return distribution;
        } catch (error) {
            console.error("Error getting status distribution:", error);
            throw new Error("Error getting status distribution: " + error.message);
        }
    }

    /**
     * Get recent activity feed
     * @param {string} userId - The user ID
     * @param {number} limit - Number of activities to return (default: 10)
     * @returns {Promise<Array>} Recent activities
     */
    static async getActivityFeed(userId, limit = 10) {
        if (!userId) {
            throw new Error("User ID is required");
        }

        try {
            // Get recently updated tasks
            const recentTasks = await prismaClient.task.findMany({
                where: { userId },
                orderBy: { updatedAt: 'desc' },
                take: limit,
                include: {
                    milestones: {
                        include: {
                            children: true
                        },
                        orderBy: { updatedAt: 'desc' }
                    }
                }
            });

            const activities = [];

            // Process tasks and milestones for activity feed
            recentTasks.forEach(task => {
                // Add task creation activity
                if (activities.length < limit) {
                    activities.push({
                        id: `task-${task.id}`,
                        type: 'task_created',
                        entityType: 'task',
                        entityId: task.id,
                        title: task.title,
                        description: `Created plan "${task.title}"`,
                        timestamp: task.createdAt
                    });
                }

                // Add milestone activities
                const flatMilestones = this.flattenMilestones(task.milestones);
                flatMilestones.forEach(milestone => {
                    if (activities.length < limit) {
                        let activityType = 'milestone_updated';
                        let description = `Updated milestone "${milestone.title}"`;

                        if (milestone.status === 'COMPLETED') {
                            activityType = 'milestone_completed';
                            description = `Completed milestone "${milestone.title}"`;
                        } else if (milestone.status === 'IN_PROGRESS') {
                            activityType = 'milestone_started';
                            description = `Started milestone "${milestone.title}"`;
                        }

                        activities.push({
                            id: `milestone-${milestone.id}`,
                            type: activityType,
                            entityType: 'milestone',
                            entityId: milestone.id,
                            taskId: task.id,
                            title: milestone.title,
                            description,
                            status: milestone.status,
                            timestamp: milestone.updatedAt
                        });
                    }
                });
            });

            // Sort all activities by timestamp and limit
            return activities
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, limit);
        } catch (error) {
            console.error("Error getting activity feed:", error);
            throw new Error("Error getting activity feed: " + error.message);
        }
    }

    /**
     * Helper method to flatten milestone hierarchy
     * @param {Array} milestones - Array of milestones with potential children
     * @returns {Array} Flattened array of all milestones
     */
    static flattenMilestones(milestones = []) {
        const result = [];
        
        const flatten = (items) => {
            items.forEach(milestone => {
                result.push(milestone);
                if (milestone.children && milestone.children.length > 0) {
                    flatten(milestone.children);
                }
            });
        };
        
        flatten(milestones);
        return result;
    }
}

module.exports = { AnalyticsService };
