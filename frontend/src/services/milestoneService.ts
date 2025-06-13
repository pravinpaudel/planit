import type { CreateMilestoneData, Milestone, UpdateMilestoneData } from '../types';
import axiosInstance from './axiosInstance';

// API service for milestones
export const milestoneService = {
  // Get all milestones for a specific plan
  getMilestones: async (planId: string): Promise<Milestone[]> => {
    const response = await axiosInstance.get(`/milestones/${planId}`);
    return response.data;
  },

  // Create a new milestone
  createMilestone: async (milestoneData: CreateMilestoneData): Promise<Milestone> => {
    const response = await axiosInstance.post(`/milestones`, milestoneData);
    return response.data;
  },

  // Update an existing milestone
  updateMilestone: async (milestoneId: string, milestoneData: UpdateMilestoneData): Promise<Milestone> => {
    const response = await axiosInstance.put(`/milestones/${milestoneId}`, milestoneData);
    return response.data;
  },

  // Delete a milestone
  deleteMilestone: async (milestoneId: string): Promise<Milestone> => {
    const response = await axiosInstance.delete(`/milestones/${milestoneId}`);
    return response.data;
  }
};

export default milestoneService;
