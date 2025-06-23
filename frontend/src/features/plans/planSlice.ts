import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { Plan, Milestone, PlanState } from '../../types';
import {
  fetchPlans,
  fetchPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  enableRoadmapSharing,
  getSharedRoadmap,
  cloneRoadmap,
  updateRoadmapSharing,
  disableRoadmapSharing
} from './planThunks';

// Initial state
const initialState: PlanState = {
  plans: [],
  activePlan: null,
  isLoading: false,
  error: null,
};

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    resetPlanState: (state) => {
      state.plans = [];
      state.activePlan = null;
      state.isLoading = false;
      state.error = null;
    },
    clearPlanError: (state) => {
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
      .addCase(fetchPlans.fulfilled, (state, action: PayloadAction<Plan[]>) => {
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
      .addCase(fetchPlanById.fulfilled, (state, action: PayloadAction<Plan>) => {
        state.isLoading = false;
        state.activePlan = action.payload;
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
      .addCase(createPlan.fulfilled, (state, action: PayloadAction<Plan>) => {
        state.isLoading = false;
        state.plans.push(action.payload);
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
      .addCase(updatePlan.fulfilled, (state, action: PayloadAction<Plan>) => {
        state.isLoading = false;
        const updatedPlan = action.payload;
        const index = state.plans.findIndex((plan) => plan.id === updatedPlan.id);
        if (index !== -1) {
          state.plans[index] = updatedPlan;
        }
        if (state.activePlan && state.activePlan.id === updatedPlan.id) {
          state.activePlan = updatedPlan;
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
      .addCase(deletePlan.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.plans = state.plans.filter((plan) => plan.id !== action.payload);
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
      .addCase(createMilestone.fulfilled, (state, action: PayloadAction<{ taskId: string; milestone: Milestone }>) => {
        state.isLoading = false;
        const { taskId, milestone } = action.payload;
        
        // Update the milestone in the appropriate plan if it's loaded
        const planIndex = state.plans.findIndex((plan) => plan.id === taskId);
        if (planIndex !== -1) {
          if (!state.plans[planIndex].milestones) {
            state.plans[planIndex].milestones = [];
          }
          state.plans[planIndex].milestones.push(milestone);
        }

        // If the active plan is the one getting updated, also update it
        if (state.activePlan && state.activePlan.id === taskId) {
          if (!state.activePlan.milestones) {
            state.activePlan.milestones = [];
          }
          state.activePlan.milestones.push(milestone);
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
      .addCase(updateMilestone.fulfilled, (state, action: PayloadAction<Milestone>) => {
        state.isLoading = false;
        const updatedMilestone = action.payload;
        
        // Helper function to update milestone in a milestones array
        const updateMilestoneInArray = (milestones: Milestone[]) => {
          const index = milestones.findIndex((m) => m.id === updatedMilestone.id);
          if (index !== -1) {
            milestones[index] = updatedMilestone;
            return true;
          }
          
          // If not found at top level, look in children
          for (const milestone of milestones) {
            if (milestone.children && milestone.children.length > 0) {
              const updated = updateMilestoneInArray(milestone.children);
              if (updated) return true;
            }
          }
          
          return false;
        };

        // Update in all plans
        for (const plan of state.plans) {
          if (plan.milestones && plan.milestones.length > 0) {
            updateMilestoneInArray(plan.milestones);
          }
        }

        // Update in active plan if it exists
        if (state.activePlan && state.activePlan.milestones) {
          updateMilestoneInArray(state.activePlan.milestones);
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
      .addCase(
        deleteMilestone.fulfilled,
        (state, action: PayloadAction<{ milestoneId: string; taskId: string }>) => {
          state.isLoading = false;
          const { milestoneId, taskId } = action.payload;
          
          // Helper function to remove milestone from array
          const removeMilestoneFromArray = (milestones: Milestone[]) => {
            // Remove from top level
            const filteredMilestones = milestones.filter((m) => m.id !== milestoneId);
            
            // If lengths are the same, milestone wasn't at top level, check children
            if (filteredMilestones.length === milestones.length) {
              for (const milestone of filteredMilestones) {
                if (milestone.children && milestone.children.length > 0) {
                  milestone.children = milestone.children.filter((m) => m.id !== milestoneId);
                }
              }
            }
            
            return filteredMilestones;
          };
          
          // Remove from plans
          const planIndex = state.plans.findIndex((plan) => plan.id === taskId);
          if (planIndex !== -1 && state.plans[planIndex].milestones) {
            state.plans[planIndex].milestones = removeMilestoneFromArray(
              state.plans[planIndex].milestones
            );
          }
          
          // Remove from active plan if it's the same plan
          if (state.activePlan && state.activePlan.id === taskId && state.activePlan.milestones) {
            state.activePlan.milestones = removeMilestoneFromArray(state.activePlan.milestones);
          }
        }
      )
      .addCase(deleteMilestone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Enable roadmap sharing
      .addCase(enableRoadmapSharing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(enableRoadmapSharing.fulfilled, (state, action: PayloadAction<{isPublic: boolean, shareableLink: string}>) => {
        state.isLoading = false;
        // Update the active plan with the new sharing settings
        if (state.activePlan) {
          state.activePlan.isPublic = action.payload.isPublic;
          state.activePlan.shareableLink = action.payload.shareableLink;
        }
        
        // Update the plans list with the new sharing settings
        const planIndex = state.plans.findIndex((plan) => plan.id === state.activePlan?.id);
        if(planIndex !== -1) {
          state.plans[planIndex].isPublic = action.payload.isPublic;
          state.plans[planIndex].shareableLink = action.payload.shareableLink;
        }
      })
      .addCase(enableRoadmapSharing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Disable roadmap sharing
      .addCase(disableRoadmapSharing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(disableRoadmapSharing.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the active plan to remove sharing settings
        if(state.activePlan) {
          state.activePlan.isPublic = false;
          state.activePlan.shareableLink = undefined; 
        }
        
        // Update the plans list to remove sharing settings
        const planIndex = state.plans.findIndex((plan) => plan.id === state.activePlan?.id);
        if(planIndex !== -1) {
          state.plans[planIndex].isPublic = false;
          state.plans[planIndex].shareableLink = undefined;
        }
      })
      .addCase(disableRoadmapSharing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Share a roadmap
      .addCase(updateRoadmapSharing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRoadmapSharing.fulfilled, (state, action: PayloadAction<Plan>) => {
        state.isLoading = false;
        // Update the active plan with the new sharing settings
        if (state.activePlan) {
          state.activePlan = action.payload;
        }
        
        // Update the plans list with the new sharing settings
        const planIndex = state.plans.findIndex((plan) => plan.id === state.activePlan?.id);
        if(planIndex !== -1) {
          state.plans[planIndex] = action.payload;
        }
      })
      .addCase(updateRoadmapSharing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch shared roadmap
      .addCase(getSharedRoadmap.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSharedRoadmap.fulfilled, (state, action: PayloadAction<Plan>) => {
        state.isLoading = false;
        // Set the active plan to the fetched shared roadmap
        state.activePlan = action.payload;
      })
      .addCase(getSharedRoadmap.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Clone a shared roadmap
      .addCase(cloneRoadmap.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cloneRoadmap.fulfilled, (state, action: PayloadAction<Plan>) => {
        state.isLoading = false;
        // Add the cloned plan to the plans list
        state.plans.push(action.payload);
        // Optionally set it as the active plan
        state.activePlan = action.payload;
      })
      .addCase(cloneRoadmap.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

  }
});

export const { resetPlanState, clearPlanError } = planSlice.actions;

// Re-export thunks to maintain backward compatibility
export {
  fetchPlans,
  fetchPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  createMilestone,
  updateMilestone,
  deleteMilestone
};

export default planSlice.reducer;
