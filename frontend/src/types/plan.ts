// Types for plan and milestone features
export type MilestoneStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK' | 'DELAYED';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  taskId: string;  // This is the parent task/plan ID
  status: MilestoneStatus;
  isComplete?: boolean; // Legacy field for backward compatibility
  deadline: string; // ISO format date
  createdAt: string; // ISO format date
  updatedAt: string; // ISO format date
  parentId?: string | null; // For hierarchical milestones - null for top-level
  children?: Milestone[]; // Child milestones
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  userId: string;
  createdAt: string; // ISO format date
  updatedAt: string; // ISO format date
  milestones: Milestone[];
  isPublic: boolean; // Indicates if the plan is public or private
  shareableLink?: string; // Optional link for sharing the plan
}

export interface PlanState {
  plans: Plan[];
  activePlan: Plan | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreatePlanData {
  title: string;
  description?: string;
}

export interface UpdatePlanData {
  title?: string;
  description?: string;
}

export interface CreateMilestoneData {
  title: string;
  description: string;
  deadline: string; // ISO format date or YYYY-MM-DD
  taskId: string;
  status?: MilestoneStatus;
  parentId?: string | null; // For hierarchical milestones
}

export interface UpdateMilestoneData {
  title?: string;
  description?: string;
  deadline?: string;
  status?: MilestoneStatus;
  isComplete?: boolean; // Legacy field for backward compatibility
  parentId?: string | null;
}

// Component props types
export interface MilestoneDetailCardProps {
  milestone: Milestone;
  onClose: () => void;
  onEdit?: (milestoneId: string) => void;
  onToggleComplete?: (milestoneId: string, isComplete: boolean) => void;
}

export interface ShareSettings {
  isPublic: boolean;
  regenerateLink?: boolean; // Optional flag to regenerate the sharable link
}

export interface Shareable {
  id: string;
  isPublic: boolean;
  shareableLink?: string;
  title: string;
}


