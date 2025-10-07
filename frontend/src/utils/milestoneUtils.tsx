import React from 'react';
import { Clock, Calendar, CheckCircle, X, Target, Edit, ShieldAlert } from 'lucide-react';
import { MilestoneStatus, Milestone } from '../types';

/**
 * Configuration for milestone status styling and display
 * This centralizes all status-related visual elements for consistency
 */
export const statusConfig: Record<MilestoneStatus, { 
  icon: React.ReactNode; 
  color: string; 
  label: string;
  ribbonColor: string;
}> = {
  NOT_STARTED: { 
    icon: <Target className="h-5 w-5" />, 
    color: 'bg-purple-50 text-purple-600 border-purple-500 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800', 
    label: 'Not Started',
    ribbonColor: "#CC6CE7"
  },
  IN_PROGRESS: { 
    icon: <Edit className="h-5 w-5" />, 
    color: 'bg-blue-50 text-blue-600 border-blue-500 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800', 
    label: 'In Progress',
    ribbonColor: "#3b82f6" 
  },
  COMPLETED: { 
    icon: <CheckCircle className="h-5 w-5" />, 
    color: 'bg-green-50 text-green-600 border-green-500 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800', 
    label: 'Completed',
    ribbonColor:  "#059669"
  },
  AT_RISK: { 
    icon:  <ShieldAlert className="h-5 w-5" />, 
    color: 'bg-red-50 text-red-600 border-red-500 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    label: 'At Risk',
    ribbonColor: "#ef4444"
  },
  DELAYED: { 
    icon: <Clock className="h-5 w-5 text-amber-500" />, 
    color: 'bg-amber-50 text-amber-600 border-amber-500 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800', 
    label: 'Delayed',
    ribbonColor: "#f59e0b"
  }
};

/**
 * Helper function to get the border color class based on milestone status
 * Useful for styling elements with consistent status colors
 */
export const getStatusBorderColor = (status: MilestoneStatus): string => {
  const colorClasses = statusConfig[status].color.split(' ');
  return colorClasses.find(cls => cls.startsWith('border-')) || 'border-gray-300';
};

/**
 * Helper function to get the background color class based on milestone status
 * Useful for styling elements with consistent status colors
 */
export const getStatusBackgroundColor = (status: MilestoneStatus): string => {
  const colorClasses = statusConfig[status].color.split(' ');
  return colorClasses.find(cls => cls.startsWith('bg-')) || 'bg-gray-100';
};


/**
 * Helper function to flatten milestone hierarchy
 * @param milestones An array of milestones, potentially with nested children
 * @returns An array of all milestones, including nested children
 */
export const getAllMilestones = (milestones: Milestone[] = []): Milestone[] => {
    // Initialize a Map to hold milestones by ID to prevent duplicates
    const milestoneMap = new Map<string, Milestone>();
    
    // Function to recursively gather milestones and their children
    const gatherMilestones = (items: Milestone[]) => {
        items.forEach(milestone => {
            // Add the current milestone to the map, using ID as key to prevent duplicates
            milestoneMap.set(milestone.id, milestone);
            
            // If this milestone has children, recursively gather them
            if (milestone.children && milestone.children.length > 0) {
                gatherMilestones(milestone.children);
            }
        });
    };
    
    // Start the recursion with the top-level milestones
    gatherMilestones(milestones);
    
    // Return the values from the map as an array (no duplicates)
    return Array.from(milestoneMap.values());
};

/**
 * 
 * @param milestones An array of milestones
 * @description This function filters out completed milestones and sorts the remaining ones by their deadline.
 * It returns an array of upcoming milestones that are not completed, sorted by their deadline in ascending order.
 * @returns An array of upcoming milestones sorted by deadline
 */
export const getUpcomingMilestones = (milestones: Milestone[]): Milestone[] => {
    return milestones.filter(milestone => milestone.status !== "COMPLETED")
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
};