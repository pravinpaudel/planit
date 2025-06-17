// import React from "react";
// import { getStatusColor, getStatusText, MilestoneStatus } from "./planStatusUtils";
// import type { cn } from "../../utils";

// /**
//  * Simpler props/interface for MilestoneCard
//  */
// interface MilestoneCardProps {
//   node: any; // d3 node type; for drag and other logic
//   isSelected: boolean;
//   onClick?: () => void;
//   onEdit?: () => void;
//   connectDrag?: (el: SVGGElement | null) => void;
//   progress?: number;
// }

// /**
//  * Renders a draggable milestone node.
//  */
// export const CARD_WIDTH = 160;
// export const CARD_HEIGHT = 70;

// const MilestoneCard: React.FC<MilestoneCardProps> = ({
//   node,
//   isSelected,
//   onClick,
//   onEdit,
//   connectDrag,
//   progress = 0.5,
// }) => {
//   const status = (node.data.status || "NOT_STARTED") as MilestoneStatus;
//   const timeInfo = !["IN_PROGRESS"].includes(status)
//     ? node.data.deadline
//       ? calculateTimeLeft(node.data.deadline)
//       : ""
//     : "";

//   // Provide a ref for drag and drop
//   const refCb = (el: SVGGElement | null) => {
//     if (connectDrag && el) connectDrag(el);
//   };

//   return (
//     <g
//       ref={refCb}
//       className={cn("milestone-card-group", isSelected && "z-10")}
//       style={{ cursor: "grab" }}
//       onClick={onClick}
//     >
//       {/* Card */}
//       <rect
//         width={CARD_WIDTH}
//         height={CARD_HEIGHT}
//         x={-CARD_WIDTH / 2}
//         y={-CARD_HEIGHT / 2}
//         rx={8}
//         fill={isSelected ? "#f9fafb" : "white"}
//         stroke={isSelected ? "#3b82f6" : "#e2e8f0"}
//         strokeWidth={isSelected ? 2 : 1}
//       />
//       {/* Left color bar */}
//       <rect
//         x={-CARD_WIDTH / 2}
//         y={-CARD_HEIGHT / 2}
//         width={6}
//         height={CARD_HEIGHT}
//         rx={3}
//         fill={getStatusColor(status).bar}
//       />
//       {/* Title */}
//       <text
//         x={-CARD_WIDTH / 2 + 16}
//         y={-16}
//         textAnchor="start"
//         fontSize={13}
//         fontWeight={"bold"}
//         fill="#0f172a"
//         dominantBaseline="central"
//       >
//         {node.data.title.length > 18
//           ? node.data.title.substring(0, 18) + "..."
//           : node.data.title}
//       </text>
//       {/* Badge */}
//       <rect
//         x={CARD_WIDTH / 2 - 70}
//         y={-CARD_HEIGHT / 2 + 10}
//         width={64}
//         height={20}
//         rx={10}
//         fill={getStatusColor(status).badge}
//       />
//       <text
//         x={CARD_WIDTH / 2 - 38}
//         y={-CARD_HEIGHT / 2 + 20}
//         textAnchor="middle"
//         fontSize={10}
//         fontWeight={600}
//         fill={getStatusColor(status).badgeText}
//         dominantBaseline="central"
//       >
//         {getStatusText(status)}
//       </text>
//       {/* Progress or due/delay */}
//       {status === "IN_PROGRESS" ? (
//         <>
//           <rect
//             x={-CARD_WIDTH / 2 + 16}
//             y={10}
//             width={CARD_WIDTH - 36}
//             height={8}
//             rx={4}
//             fill="#e0e7ef"
//           />
//           <rect
//             x={-CARD_WIDTH / 2 + 16}
//             y={10}
//             width={(CARD_WIDTH - 36) * progress}
//             height={8}
//             rx={4}
//             fill={getStatusColor(status).bar}
//           />
//           <text
//             x={(CARD_WIDTH - 36) / 2 + (-CARD_WIDTH / 2 + 16)}
//             y={14}
//             textAnchor="middle"
//             fontSize={10}
//             fill="#334155"
//             dominantBaseline="middle"
//           >
//             {Math.round(progress * 100)}%
//           </text>
//         </>
//       ) : (
//         <text
//           x={-CARD_WIDTH / 2 + 16}
//           y={8}
//           fontSize={10}
//           fill="#64748b"
//           textAnchor="start"
//           dominantBaseline="central"
//         >
//           {timeInfo}
//         </text>
//       )}
//       {/* Edit button */}
//       {onEdit && isSelected && (
//         <text
//           x={CARD_WIDTH / 2 - 24}
//           y={CARD_HEIGHT / 2 - 14}
//           textAnchor="middle"
//           fontSize={16}
//           fill="#3b82f6"
//           style={{ cursor: "pointer" }}
//           onClick={e => {
//             e.stopPropagation();
//             onEdit();
//           }}
//         >
//           ✎
//         </text>
//       )}
//     </g>
//   );
// };

// function calculateTimeLeft(deadline?: string) {
//   if (!deadline) return "";
//   const deadlineDate = new Date(deadline);
//   const now = new Date();
//   if (isNaN(deadlineDate.getTime())) return "";
//   const diffDays = Math.ceil(
//     (deadlineDate.getTime() - now.getTime()) /
//       (1000 * 60 * 60 * 24)
//   );
//   if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
//   if (diffDays === 0) return "Due today";
//   if (diffDays === 1) return "1 day left";
//   return `${diffDays} days left`;
// }

// export default MilestoneCard;