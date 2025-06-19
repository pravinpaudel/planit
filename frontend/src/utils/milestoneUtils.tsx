import React from 'react';
import { Clock, Calendar, CheckCircle, X, Target, Edit } from 'lucide-react';
import { MilestoneStatus } from '../types';

/**
 * Configuration for milestone status styling and display
 * This centralizes all status-related visual elements for consistency
 */
export const statusConfig: Record<MilestoneStatus, { 
  icon: React.ReactNode; 
  color: string; 
  label: string 
}> = {
  NOT_STARTED: { 
    icon: <Target className="h-5 w-5" />, 
    color: 'bg-blue-50 text-blue-600 border-blue-500 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800', 
    label: 'Not Started' 
  },
  IN_PROGRESS: { 
    icon: <Edit className="h-5 w-5" />, 
    color: 'bg-purple-50 text-purple-600 border-purple-500 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800', 
    label: 'In Progress' 
  },
  COMPLETED: { 
    icon: <CheckCircle className="h-5 w-5" />, 
    color: 'bg-green-50 text-green-600 border-green-500 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800', 
    label: 'Completed' 
  },
  AT_RISK: { 
    icon: <Clock className="h-5 w-5" />, 
    color: 'bg-amber-50 text-amber-600 border-amber-500 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800', 
    label: 'At Risk' 
  },
  DELAYED: { 
    icon: <X className="h-5 w-5" />, 
    color: 'bg-red-50 text-red-600 border-red-500 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800', 
    label: 'Delayed' 
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
