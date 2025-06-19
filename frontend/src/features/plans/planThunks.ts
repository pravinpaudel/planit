import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  CreatePlanData, 
  UpdatePlanData, 
  CreateMilestoneData, 
  UpdateMilestoneData 
} from '../../types';
import planService from '../../services/planService';
import milestoneService from '../../services/milestoneService';

/**
 * Plan-related thunks
 */

// Fetch all plans
export const fetchPlans = createAsyncThunk(
  'plan/fetchAll', 
  async (_, { rejectWithValue }) => {
    try {
      const plans = await planService.getAllPlans();
      return plans;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch plans');
    }
  }
);

// Fetch plan by ID
export const fetchPlanById = createAsyncThunk(
  'plan/fetchById', 
  async (planId: string, { rejectWithValue }) => {
    try {
      const plan = await planService.getPlan(planId);
      return plan;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch plan');
    }
  }
);

// Create a new plan
export const createPlan = createAsyncThunk(
  'plan/create',
  async (planData: CreatePlanData, { rejectWithValue }) => {
    try {
      const plan = await planService.createPlan(planData);
      return plan;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create plan');
    }
  }
);

// Update an existing plan
export const updatePlan = createAsyncThunk(
  'plan/update',
  async ({ planId, planData }: { planId: string; planData: UpdatePlanData }, { rejectWithValue }) => {
    try {
      const plan = await planService.updatePlan(planId, planData);
      return plan;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update plan');
    }
  }
);

// Delete a plan
export const deletePlan = createAsyncThunk(
  'plan/delete', 
  async (planId: string, { rejectWithValue }) => {
    try {
      await planService.deletePlan(planId);
      return planId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete plan');
    }
  }
);

/**
 * Milestone-related thunks
 */

// Create a milestone
export const createMilestone = createAsyncThunk(
  'plan/createMilestone',
  async (milestoneData: CreateMilestoneData, { rejectWithValue }) => {
    try {
      const milestone = await milestoneService.createMilestone(milestoneData);
      return { taskId: milestoneData.taskId, milestone };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create milestone');
    }
  }
);

// Update a milestone
export const updateMilestone = createAsyncThunk(
  'plan/updateMilestone',
  async (
    { milestoneId, milestoneData }: { milestoneId: string; milestoneData: UpdateMilestoneData },
    { rejectWithValue }
  ) => {
    try {
      const milestone = await milestoneService.updateMilestone(milestoneId, milestoneData);
      return milestone;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update milestone');
    }
  }
);

// Delete a milestone
export const deleteMilestone = createAsyncThunk(
  'plan/deleteMilestone',
  async ({ milestoneId, taskId }: { milestoneId: string; taskId: string }, { rejectWithValue }) => {
    try {
      await milestoneService.deleteMilestone(milestoneId);
      return { milestoneId, taskId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete milestone');
    }
  }
);
