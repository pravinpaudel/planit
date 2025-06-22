import type { CreatePlanData, Plan, UpdatePlanData, ShareSettings } from '../types';
import axiosInstance from './axiosInstance';

// API service for tasks (plans)
export const planService = {
  // Get all plans
  getAllPlans: async (): Promise<Plan[]> => {
    const response = await axiosInstance.get(`/tasks`);
    return response.data;
  },

  // Get a specific plan with its milestones
  getPlan: async (planId: string): Promise<Plan> => {
    const response = await axiosInstance.get(`/tasks/${planId}`);
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
  },

  // Share a plan (make it public and generate a sharable link)
  enableRoadmapSharing: async (planId: string): Promise<{isPublic: boolean, sharableLink: string}> => {
    const response = await axiosInstance.post(`/tasks/${planId}/share`);
    return response.data;
  },

  // Update the shared roadmap settings (e.g., make it public/private, regenerate link)
  updateRoadmapSharing: async (planId: string, shareSettings: ShareSettings): Promise<Plan> => {
    const response = await axiosInstance.put(`/tasks/${planId}/share`, shareSettings);
    return response.data;
  },

  // Disable sharing for a roadmap (make it private)
  disableRoadmapSharing: async (planId: string): Promise<Plan> => {
    const response = await axiosInstance.delete(`/tasks/${planId}/share`);
    return response.data;
  },

  // Get a shared roadmap by its shared ID
  getSharedRoadmap: async (sharedId: string): Promise<Plan> => {
    const response = await axiosInstance.get(`/tasks/shared/${sharedId}`);
    return response.data;
  },

  // Clone a shared roadmap by its shared ID
  cloneRoadmap: async (sharedId: string): Promise<Plan> => {
    const response = await axiosInstance.post(`/tasks/shared/${sharedId}/clone`);
    return response.data;
  }
};

export default planService;
