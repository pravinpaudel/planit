import { RootState } from '../../store';
import { Plan, Milestone } from '../../types';

/**
 * Selects all plans
 */
export const selectAllPlans = (state: RootState): Plan[] => state.plan.plans;

/**
 * Selects the currently active plan
 */
export const selectActivePlan = (state: RootState): Plan | null => state.plan.activePlan;

/**
 * Selects a plan by ID
 */
export const selectPlanById = (planId: string) => (state: RootState): Plan | undefined => 
  state.plan.plans.find(plan => plan.id === planId);

/**
 * Selects the loading state for plans
 */
export const selectPlanLoading = (state: RootState): boolean => state.plan.isLoading;

/**
 * Selects any error related to plans
 */
export const selectPlanError = (state: RootState): string | null => state.plan.error;

/**
 * Selects all milestones from the active plan
 */
export const selectActivePlanMilestones = (state: RootState): Milestone[] => 
  state.plan.activePlan?.milestones || [];
