import axiosInstance from './axiosInstance';

export interface DashboardStats {
  totalPlans: number;
  activePlans: number;
  completedPlans: number;
  totalMilestones: number;
  completedMilestones: number;
  inProgressMilestones: number;
  notStartedMilestones: number;
  atRiskMilestones: number;
  delayedMilestones: number;
  completionRate: number;
  dueToday: number;
  dueThisWeek: number;
  overdueMilestones: number;
  upcomingMilestones: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    deadline: string;
    taskId: string;
  }>;
}

export interface TrendData {
  date: string;
  completed: number;
  total: number;
}

export interface StatusDistribution {
  NOT_STARTED: number;
  IN_PROGRESS: number;
  COMPLETED: number;
  AT_RISK: number;
  DELAYED: number;
}

export interface Activity {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  taskId?: string;
  title: string;
  description: string;
  status?: string;
  timestamp: string;
}

// API service for analytics
export const analyticsService = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await axiosInstance.get('/analytics/dashboard');
    return response.data;
  },

  // Get completion trends
  getCompletionTrends: async (days: number = 30): Promise<TrendData[]> => {
    const response = await axiosInstance.get(`/analytics/trends?days=${days}`);
    return response.data;
  },

  // Get status distribution
  getStatusDistribution: async (): Promise<StatusDistribution> => {
    const response = await axiosInstance.get('/analytics/status-distribution');
    return response.data;
  },

  // Get activity feed
  getActivityFeed: async (limit: number = 10): Promise<Activity[]> => {
    const response = await axiosInstance.get(`/analytics/activity?limit=${limit}`);
    return response.data;
  }
};

export default analyticsService;
