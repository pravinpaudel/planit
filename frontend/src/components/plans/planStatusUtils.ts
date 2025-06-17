/**
 * Types and utility functions for plan and milestone statuses
 */

export type MilestoneStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK' | 'DELAYED';

interface StatusColors {
  bar: string;      // Color for the left side status bar
  badge: string;    // Background color for the status badge
  badgeText: string; // Text color for the status badge
  border?: string;  // Optional border color (used in some views)
  text?: string;    // Optional text color (used in some views)
}

/**
 * Get color scheme for a milestone status
 * @param status Milestone status
 * @returns Object with color values for different UI elements
 */
export function getStatusColor(status: MilestoneStatus): StatusColors {
  switch (status) {
    case 'COMPLETED':
      return {
        bar: '#22c55e',      // Green
        badge: '#dcfce7',    // Light Green
        badgeText: '#166534', // Dark Green
        border: '#86efac',   // Medium Green
        text: '#166534'      // Dark Green
      };
    case 'IN_PROGRESS':
      return {
        bar: '#3b82f6',      // Blue
        badge: '#dbeafe',    // Light Blue
        badgeText: '#1e40af', // Dark Blue
        border: '#93c5fd',   // Medium Blue
        text: '#1e40af'      // Dark Blue
      };
    case 'AT_RISK':
      return {
        bar: '#f59e0b',      // Amber
        badge: '#fef3c7',    // Light Amber
        badgeText: '#92400e', // Dark Amber
        border: '#fcd34d',   // Medium Amber
        text: '#92400e'      // Dark Amber
      };
    case 'DELAYED':
      return {
        bar: '#ef4444',      // Red
        badge: '#fee2e2',    // Light Red
        badgeText: '#b91c1c', // Dark Red
        border: '#fca5a5',   // Medium Red
        text: '#b91c1c'      // Dark Red
      };
    case 'NOT_STARTED':
    default:
      return {
        bar: '#94a3b8',      // Slate
        badge: '#f1f5f9',    // Light Slate
        badgeText: '#475569', // Dark Slate
        border: '#cbd5e1',   // Medium Slate
        text: '#475569'      // Dark Slate
      };
  }
}

/**
 * Get human-readable text for a milestone status
 * @param status Milestone status
 * @returns User-friendly status text
 */
export function getStatusText(status: MilestoneStatus): string {
  switch (status) {
    case 'COMPLETED':
      return 'Completed';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'AT_RISK':
      return 'At Risk';
    case 'DELAYED':
      return 'Delayed';
    case 'NOT_STARTED':
    default:
      return 'Not Started';
  }
}

/**
 * Convert a status string (possibly from API) to our MilestoneStatus type
 * @param status Status string from API or other source
 * @returns Validated MilestoneStatus
 */
export function parseStatus(status: string | undefined): MilestoneStatus {
  if (!status) return 'NOT_STARTED';
  
  const normalized = status.toUpperCase();
  
  switch (normalized) {
    case 'COMPLETED':
    case 'COMPLETE':
    case 'DONE':
      return 'COMPLETED';
    case 'IN_PROGRESS':
    case 'IN PROGRESS':
    case 'INPROGRESS':
    case 'ONGOING':
      return 'IN_PROGRESS';
    case 'AT_RISK':
    case 'AT RISK':
    case 'ATRISK':
    case 'RISK':
      return 'AT_RISK';
    case 'DELAYED':
    case 'LATE':
    case 'BEHIND':
    case 'OVERDUE':
      return 'DELAYED';
    case 'NOT_STARTED':
    case 'NOT STARTED':
    case 'NOTSTARTED':
    case 'TODO':
    case 'TO DO':
    case 'PENDING':
    default:
      return 'NOT_STARTED';
  }
}
