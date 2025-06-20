// /**
//  * Helper utilities for milestone rendering (badge color, bar color, etc)
//  */
// export type MilestoneStatus = "COMPLETED" | "IN_PROGRESS" | "AT_RISK" | "DELAYED" | "NOT_STARTED";

// export const PLAN_STATUS_COLORS = {
//   COMPLETED:   { bar: "#22c55e", badge: "#dcfce7",      badgeText: "#166534" },
//   IN_PROGRESS: { bar: "#3b82f6", badge: "#dbeafe",      badgeText: "#1e40af" },
//   AT_RISK:     { bar: "#f59e0b", badge: "#fef3c7",      badgeText: "#854d0e" },
//   DELAYED:     { bar: "#ef4444", badge: "#fee2e2",      badgeText: "#b91c1c" },
//   NOT_STARTED: { bar: "#94a3b8", badge: "#f1f5f9",      badgeText: "#475569" },
// };

// export function getStatusColor(status: MilestoneStatus) {
//   return PLAN_STATUS_COLORS[status] || PLAN_STATUS_COLORS.NOT_STARTED;
// }

// export function getStatusText(status: MilestoneStatus) {
//   switch (status) {
//     case "COMPLETED": return "completed";
//     case "IN_PROGRESS": return "in progress";
//     case "AT_RISK": return "at risk";
//     case "DELAYED": return "delayed";
//     case "NOT_STARTED": default: return "not started";
//   }
// }