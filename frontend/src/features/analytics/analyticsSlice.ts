import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import analyticsService, { 
  DashboardStats, 
  TrendData, 
  StatusDistribution, 
  Activity 
} from '../../services/analyticsService';

export interface AnalyticsState {
  dashboardStats: DashboardStats | null;
  trends: TrendData[];
  statusDistribution: StatusDistribution | null;
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  dashboardStats: null,
  trends: [],
  statusDistribution: null,
  activities: [],
  isLoading: false,
  error: null
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'analytics/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await analyticsService.getDashboardStats();
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchCompletionTrends = createAsyncThunk(
  'analytics/fetchCompletionTrends',
  async (days: number = 30, { rejectWithValue }) => {
    try {
      const trends = await analyticsService.getCompletionTrends(days);
      return trends;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch completion trends');
    }
  }
);

export const fetchStatusDistribution = createAsyncThunk(
  'analytics/fetchStatusDistribution',
  async (_, { rejectWithValue }) => {
    try {
      const distribution = await analyticsService.getStatusDistribution();
      return distribution;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch status distribution');
    }
  }
);

export const fetchActivityFeed = createAsyncThunk(
  'analytics/fetchActivityFeed',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const activities = await analyticsService.getActivityFeed(limit);
      return activities;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch activity feed');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
    },
    resetAnalytics: (state) => {
      state.dashboardStats = null;
      state.trends = [];
      state.statusDistribution = null;
      state.activities = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Dashboard Stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Completion Trends
    builder
      .addCase(fetchCompletionTrends.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompletionTrends.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trends = action.payload;
      })
      .addCase(fetchCompletionTrends.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Status Distribution
    builder
      .addCase(fetchStatusDistribution.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStatusDistribution.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statusDistribution = action.payload;
      })
      .addCase(fetchStatusDistribution.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Activity Feed
    builder
      .addCase(fetchActivityFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActivityFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activities = action.payload;
      })
      .addCase(fetchActivityFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearAnalyticsError, resetAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
