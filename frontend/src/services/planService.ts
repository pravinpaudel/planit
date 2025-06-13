import type { CreatePlanData, Plan, UpdatePlanData } from '../types';
import axiosInstance from './axiosInstance';

// API service for tasks (plans)
export const planService = {
  // Get all plans
  getAllPlans: async (): Promise<Plan[]> => {
    const response = await axiosInstance.get(`/tasks`);
    return response.data;
  },

  // Get all milestones for a specific plan
  getPlan: async (planId: string): Promise<Plan> => {
    const response = await axiosInstance.get(`/milestones/${planId}`);
    return response.data;
  },

  // Create a new plan
  createPlan: async (planData: CreatePlanData): Promise<Plan> => {
    const response = await axiosInstance.post(`/tasks`, planData);
    return response.data;
  },

  // Update an existing plan
  updatePlan: async (planId: string, planData: UpdatePlanData): Promise<Plan> => {
    const response = await axiosInstance.put(`/tasks/${planId}`, planData);
    return response.data;
  },

  // Delete a plan
  deletePlan: async (planId: string): Promise<void> => {
    await axiosInstance.delete(`/tasks/${planId}`);
  }
};

export default planService;
