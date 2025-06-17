import * as d3 from "d3";
import { Milestone } from "../../../types/plan";

/**
 * Find root nodes (milestones with no parent)
 */
export function findRootNodes(milestones: Record<string, Milestone>): string[] {
  return Object.keys(milestones).filter(
    (id) => !milestones[id].parentId || milestones[id].parentId === null
  );
}

/**
 * Build hierarchical data structure recursively
 */
export function buildHierarchicalData(
  milestoneId: string,
  milestonesData: Record<string, Milestone>,
  visited: Set<string> = new Set()
): Milestone {
  if (visited.has(milestoneId)) {
    return {
      id: milestoneId,
      title: "Circular Reference",
      description: "",
      taskId: "",
      status: "NOT_STARTED",
      deadline: "",
      createdAt: "",
      updatedAt: "",
      children: [],
    };
  }
  const milestone = milestonesData[milestoneId];
  if (!milestone) {
    return {
      id: milestoneId,
      title: "Missing Milestone",
      description: "",
      taskId: "",
      status: "NOT_STARTED",
      deadline: "",
      createdAt: "",
      updatedAt: "",
      children: [],
    };
  }
  visited.add(milestoneId);
  const childMilestones = Object.values(milestonesData).filter(
    (m) => m.parentId === milestoneId
  );
  return {
    ...milestone,
    children: childMilestones.map((child) =>
      buildHierarchicalData(child.id, milestonesData, new Set(visited))
    ),
  };
}

/**
 * Create D3 hierarchy from milestone data
 */
export function createHierarchy(
  milestones: Record<string, Milestone>, 
  planTitle: string
): d3.HierarchyNode<Milestone> | null {
  const rootNodes = findRootNodes(milestones);
  if (rootNodes.length === 0) return null;
  
  const virtualRoot: Milestone = {
    id: "virtual-root",
    title: planTitle,
    description: "",
    taskId: "",
    status: "NOT_STARTED",
    deadline: "",
    createdAt: "",
    updatedAt: "",
    children: rootNodes.map((id) => buildHierarchicalData(id, milestones)),
  };
  return d3.hierarchy(virtualRoot);
}

/**
 * Calculate time left for deadline display
 */
export function calculateTimeLeft(deadline: string): string {
  if (!deadline) return "";
  const deadlineDate = new Date(deadline),
    now = new Date();
  if (isNaN(deadlineDate.getTime())) return "";
  
  const diffDays = Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "1 day left";
  return `${diffDays} days left`;
}

/**
 * Setup zoom behavior for SVG
 */
export function setupZoom(
  svgElement: SVGSVGElement, 
  gElement: SVGGElement
): d3.ZoomBehavior<SVGSVGElement, unknown> {
  const svg = d3.select(svgElement);
  const g = d3.select(gElement);
  
  const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 3])
    .on("zoom", (event) => {
      if (event.transform) {
        g.attr("transform", event.transform.toString());
      }
    });
    
  svg.call(zoomBehavior);
  return zoomBehavior;
}

/**
 * Center and scale visualization to fit viewport
 */
export function centerVisualization(
  svgElement: SVGSVGElement,
  gElement: SVGGElement,
  zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown>
): void {
  const svgRect = svgElement.getBoundingClientRect();
  const gBounds = gElement.getBBox();
  
  const scale = Math.min(
    0.9 * svgRect.width / gBounds.width,
    0.9 * svgRect.height / gBounds.height
  );
  
  const translateX = (svgRect.width/2) - (gBounds.x + gBounds.width/2) * scale;
  const translateY = (svgRect.height/2) - (gBounds.y + gBounds.height/2) * scale;
  
  d3.select(svgElement)
    .transition()
    .duration(750)
    .call(zoomBehavior.transform as any, d3.zoomIdentity.translate(translateX, translateY).scale(scale));
}
