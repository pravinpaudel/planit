import * as d3 from "d3";

export interface Milestone {
  id: string;
  title: string;
  status: "COMPLETED" | "IN_PROGRESS" | "AT_RISK" | "DELAYED" | "NOT_STARTED";
  description?: string;
  parentId?: string | null;
  taskId?: string;
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
  children?: Milestone[];
}

/** Find root node IDs (no parentId or parentId === null) */
export function findRootNodes(milestones: Record<string, Milestone>): string[] {
  return Object.keys(milestones).filter(
    id => !milestones[id].parentId || milestones[id].parentId === null
  );
}

/** Recursively builds hierarchy */
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
      status: "NOT_STARTED",
      children: [],
    };
  }
  const milestone = milestonesData[milestoneId];
  if (!milestone) {
    return {
      id: milestoneId,
      title: "Missing Milestone",
      description: "",
      status: "NOT_STARTED",
      children: [],
    };
  }
  visited.add(milestoneId);
  const childMilestones = Object.values(milestonesData).filter(
    m => m.parentId === milestoneId
  );
  return {
    ...milestone,
    children: childMilestones.map(child =>
      buildHierarchicalData(child.id, milestonesData, new Set(visited))
    ),
  };
}

/** D3 hierarchy builder given a milestones dict and planTitle */
export function createHierarchy(
  milestones: Record<string, Milestone>,
  planTitle: string
): d3.HierarchyNode<Milestone> | null {
  const rootNodes = findRootNodes(milestones);

  if (rootNodes.length === 0) return null;

  const virtualRoot: Milestone = {
    id: "virtual-root",
    title: planTitle,
    status: "NOT_STARTED",
    children: rootNodes.map(id => buildHierarchicalData(id, milestones)),
  };
  return d3.hierarchy(virtualRoot);
}
