// Types for plan and milestone features
export interface Milestone {
  id: string;
  title: string;
  description: string;
  taskId: string;  // This is the parent task/plan ID
  isComplete: boolean;
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
  parentId?: string | null; // For hierarchical milestones
}

export interface UpdateMilestoneData {
  title?: string;
  description?: string;
  deadline?: string;
  isComplete?: boolean;
  parentId?: string | null;
}
