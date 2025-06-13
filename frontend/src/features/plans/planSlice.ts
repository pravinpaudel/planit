import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { Plan, CreatePlanData, UpdatePlanData, Milestone, PlanState, CreateMilestoneData, UpdateMilestoneData } from '../../types';
import planService from '../../services/planService';
import milestoneService from '../../services/milestoneService';
import { RootState } from '../../store';

// Initial state
const initialState: PlanState = {
  plans: [],
  activePlan: null,
  isLoading: false,
  error: null,
};

// Async thunks for plans
export const fetchPlans = createAsyncThunk('plan/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const plans = await planService.getAllPlans();
    return plans;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch plans');
  }
});

export const fetchPlanById = createAsyncThunk('plan/fetchById', async (planId: string, { rejectWithValue }) => {
  try {
    const plan = await planService.getPlan(planId);
    return plan;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch plan');
  }
});

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

export const deletePlan = createAsyncThunk('plan/delete', async (planId: string, { rejectWithValue }) => {
  try {
    await planService.deletePlan(planId);
    return planId;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || 'Failed to delete plan');
  }
});

// Async thunks for milestones
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

export const updateMilestone = createAsyncThunk(
  'plan/updateMilestone',
  async (
    { milestoneId, milestoneData }: { milestoneId: string; milestoneData: UpdateMilestoneData },
    { rejectWithValue, getState }
  ) => {
    try {
      const milestone = await milestoneService.updateMilestone(milestoneId, milestoneData);
      const state = getState() as RootState;
      const activePlanId = state.plan.activePlan?.id;
      return { milestone, activePlanId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update milestone');
    }
  }
);

export const deleteMilestone = createAsyncThunk(
  'plan/deleteMilestone',
  async (milestoneId: string, { rejectWithValue, getState }) => {
    try {
      const milestone = await milestoneService.deleteMilestone(milestoneId);
      const state = getState() as RootState;
      const activePlanId = state.plan.activePlan?.id;
      return { milestone, activePlanId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete milestone');
    }
  }
);

// Helper function to organize milestones in a hierarchical structure
const organizeMilestones = (milestones: Milestone[]): Milestone[] => {
  // Create a map for O(1) lookups
  const milestoneMap: Record<string, Milestone> = {};
  
  // First pass: store all milestones by ID with empty children arrays
  milestones.forEach(milestone => {
    milestoneMap[milestone.id] = {
      ...milestone,
      children: [],
    };
  });
  
  // Second pass: build the hierarchy
  const rootMilestones: Milestone[] = [];
  
  milestones.forEach(milestone => {
    const milestoneWithChildren = milestoneMap[milestone.id];
    
    if (!milestone.parentId) {
      // This is a root-level milestone
      rootMilestones.push(milestoneWithChildren);
    } else if (milestoneMap[milestone.parentId]) {
      // This milestone has a parent, add it to the parent's children
      milestoneMap[milestone.parentId].children!.push(milestoneWithChildren);
    } else {
      // Parent not found, treat as root level
      rootMilestones.push(milestoneWithChildren);
    }
  });

  // Third pass: calculate depth (for UI rendering)
  const calculateDepth = (milestone: Milestone, depth: number) => {
    if (milestone.children && milestone.children.length > 0) {
      milestone.children.forEach(child => calculateDepth(child, depth + 1));
    }
  };

  rootMilestones.forEach(milestone => calculateDepth(milestone, 0));
  
  return rootMilestones;
};

// Create the plan slice
const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    setActivePlan: (state, action: PayloadAction<Plan | null>) => {
      state.activePlan = action.payload;
      if (state.activePlan?.milestones) {
        state.activePlan.milestones = organizeMilestones(state.activePlan.milestones);
      }
    },
    clearPlanErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all plans
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // Fetch plan by ID
      .addCase(fetchPlanById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlanById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activePlan = {
          ...action.payload,
          milestones: organizeMilestones(action.payload.milestones || [])
        };
      })
      .addCase(fetchPlanById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // Create plan
      .addCase(createPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans.push(action.payload);
        state.activePlan = action.payload;
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // Update plan
      .addCase(updatePlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.plans.findIndex(plan => plan.id === action.payload.id);
        if (index !== -1) {
          state.plans[index] = action.payload;
        }
        if (state.activePlan && state.activePlan.id === action.payload.id) {
          state.activePlan = action.payload;
        }
      })
      .addCase(updatePlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // Delete plan
      .addCase(deletePlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = state.plans.filter(plan => plan.id !== action.payload);
        if (state.activePlan && state.activePlan.id === action.payload) {
          state.activePlan = null;
        }
      })
      .addCase(deletePlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // Create milestone
      .addCase(createMilestone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMilestone.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add milestone to active plan if it's the same plan
        if (state.activePlan && state.activePlan.id === action.payload.taskId) {
          state.activePlan.milestones = [
            ...state.activePlan.milestones || [],
            action.payload.milestone
          ];
          // Re-organize to maintain hierarchy
          state.activePlan.milestones = organizeMilestones(state.activePlan.milestones);
        }
        
        // Also update the milestone in the plans array
        const planIndex = state.plans.findIndex(plan => plan.id === action.payload.taskId);
        if (planIndex !== -1) {
          if (!state.plans[planIndex].milestones) {
            state.plans[planIndex].milestones = [];
          }
          state.plans[planIndex].milestones.push(action.payload.milestone);
        }
      })
      .addCase(createMilestone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // Update milestone
      .addCase(updateMilestone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMilestone.fulfilled, (state, action) => {
        state.isLoading = false;
        const { milestone, activePlanId } = action.payload;
        
        // Update milestone in active plan
        if (state.activePlan && state.activePlan.id === activePlanId) {
          const index = state.activePlan.milestones.findIndex(m => m.id === milestone.id);
          if (index !== -1) {
            state.activePlan.milestones[index] = {
              ...state.activePlan.milestones[index],
              ...milestone
            };
            // Re-organize to maintain hierarchy
            state.activePlan.milestones = organizeMilestones(state.activePlan.milestones);
          }
        }
        
        // Also update the milestone in the plans array
        const planIndex = state.plans.findIndex(plan => plan.id === activePlanId);
        if (planIndex !== -1) {
          const milestoneIndex = state.plans[planIndex].milestones?.findIndex(m => m.id === milestone.id) ?? -1;
          if (milestoneIndex !== -1) {
            state.plans[planIndex].milestones[milestoneIndex] = {
              ...state.plans[planIndex].milestones[milestoneIndex],
              ...milestone
            };
          }
        }
      })
      .addCase(updateMilestone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // Delete milestone
      .addCase(deleteMilestone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMilestone.fulfilled, (state, action) => {
        state.isLoading = false;
        const { milestone, activePlanId } = action.payload;
        
        // Delete milestone from active plan
        if (state.activePlan && state.activePlan.id === activePlanId) {
          state.activePlan.milestones = state.activePlan.milestones.filter(m => m.id !== milestone.id);
          // Re-organize to maintain hierarchy
          state.activePlan.milestones = organizeMilestones(state.activePlan.milestones);
        }
        
        // Also delete the milestone from the plans array
        const planIndex = state.plans.findIndex(plan => plan.id === activePlanId);
        if (planIndex !== -1) {
          state.plans[planIndex].milestones = state.plans[planIndex].milestones?.filter(m => m.id !== milestone.id) ?? [];
        }
      })
      .addCase(deleteMilestone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActivePlan, clearPlanErrors } = planSlice.actions;

export default planSlice.reducer;
