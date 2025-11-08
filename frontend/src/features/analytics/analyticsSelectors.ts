import { RootState } from '../../store';

export const selectDashboardStats = (state: RootState) => state.analytics.dashboardStats;
export const selectCompletionTrends = (state: RootState) => state.analytics.trends;
export const selectStatusDistribution = (state: RootState) => state.analytics.statusDistribution;
export const selectActivityFeed = (state: RootState) => state.analytics.activities;
export const selectAnalyticsLoading = (state: RootState) => state.analytics.isLoading;
export const selectAnalyticsError = (state: RootState) => state.analytics.error;
