import { useRef } from 'react';
import * as d3 from 'd3';
import { useCallback, useEffect } from 'react';
import { Milestone } from '../../types/plan';

interface D3TreeVisualizationProps {
  milestones: Record<string, Milestone>;
  onMilestoneClick: (id: string) => void;
  selectedMilestone: string | null;
}

// Interface that combines Milestone properties with hierarchy structure for D3
interface HierarchyData {
  id: string;
  title: string;
  description: string;
  taskId: string;
  isComplete: boolean;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string | null;
  status?: 'completed' | 'in_progress' | 'at_risk' | 'not_started';
  children?: HierarchyData[];
}

const D3TreeVisualization = ({ milestones, onMilestoneClick, selectedMilestone }: D3TreeVisualizationProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  
  // Find root nodes (nodes without parents or with null parentId)
  const findRootNodes = useCallback((milestones: Record<string, Milestone>): string[] => {
    return Object.keys(milestones).filter(id => {
      const milestone = milestones[id];
      return !milestone.parentId || milestone.parentId === null;
    });
  }, []);

  // Create D3 hierarchy from milestone data
  const createHierarchy = useCallback(() => {
    const rootNodes = findRootNodes(milestones);
    
    if (rootNodes.length === 0) return null;
    
    // Handle multiple roots with virtual parent
    if (rootNodes.length > 1) {
      const virtualRoot: Milestone = {
        id: 'virtual-root',
        title: 'Project Root',
        description: '',
        taskId: '',
        isComplete: false,
        deadline: '',
        createdAt: '',
        updatedAt: '',
        children: rootNodes.map(id => buildHierarchicalData(id, milestones))
      };
      return d3.hierarchy(virtualRoot);
    }
    
    return d3.hierarchy(buildHierarchicalData(rootNodes[0], milestones));
  }, [milestones, findRootNodes]);

  // Build hierarchical structure
  const buildHierarchicalData = (
    milestoneId: string,
    milestonesData: Record<string, Milestone>,
    visited: Set<string> = new Set<string>()
  ): Milestone => {
    if (visited.has(milestoneId)) {
      return {
        id: milestoneId,
        title: 'Circular Reference',
        description: '',
        taskId: '',
        isComplete: false,
        deadline: '',
        createdAt: '',
        updatedAt: '',
        children: []
      };
    }
    
    const milestone = milestonesData[milestoneId];
    if (!milestone) {
      return {
        id: milestoneId,
        title: 'Missing Milestone',
        description: '',
        taskId: '',
        isComplete: false,
        deadline: '',
        createdAt: '',
        updatedAt: '',
        children: []
      };
    }
    
    visited.add(milestoneId);
    
    // Get all children that reference this milestone as parent
    const childMilestones = Object.values(milestonesData).filter(
      m => m.parentId === milestoneId
    );
    
    return {
      ...milestone,
      children: childMilestones.map(child => 
        buildHierarchicalData(child.id, milestonesData, new Set(visited))
      )
    };
  };

  // Render node visuals (rectangles, text, progress indicators)
  const renderNodeVisuals = (
    nodeGroups: d3.Selection<SVGGElement, d3.HierarchyPointNode<Milestone>, SVGGElement, unknown>,
    selectedId: string | null
  ) => {
    // Add rectangles for nodes
    nodeGroups
      .append('rect')
      .attr('width', 150)
      .attr('height', 60)
      .attr('x', -75)
      .attr('y', -30)
      .attr('rx', 6)
      .attr('fill', d => d.data.id === selectedId ? '#3b82f6' : '#f8fafc')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2);

    // Add milestone titles
    nodeGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', d => d.data.id === selectedId ? '#ffffff' : '#0f172a')
      .text(d => d.data.title || 'Untitled');

    // Add status indicators if available
    nodeGroups
      .filter(d => d.data.isComplete !== undefined)
      .append('circle')
      .attr('cx', 60)
      .attr('cy', -22)
      .attr('r', 6)
      .attr('fill', d => {
        const status = d.data.isComplete;
        switch(status) {
          case true: return '#22c55e';
          case false: return '#ef4444';
          default: return '#94a3b8';
        }
      });
  };

  // D3 rendering logic
  const renderTree = useCallback(() => {
    if (!svgRef.current || !gRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    
    g.selectAll("*").remove();

    const hierarchy = createHierarchy();
    if (!hierarchy) return;

    // Configure tree layout
    const treeLayout = d3.tree<Milestone>()
      .size([1000, 600])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.2));

    const root = treeLayout(hierarchy);

    // Render links
    const links = root.links().filter(d => d.source.data.id !== 'virtual-root');
    
    g.selectAll('.link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkVertical<d3.HierarchyPointLink<Milestone>, d3.HierarchyPointNode<Milestone>>()
        .x(d => d.x)
        .y(d => d.y))
      .attr('fill', 'none')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 2);

    // Render nodes
    const nodes = root.descendants().filter(d => d.data.id !== 'virtual-root');

    const nodeGroups = g.selectAll<SVGGElement, d3.HierarchyPointNode<Milestone>>('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onMilestoneClick(d.data.id);
      });

    // Add node visuals (rectangles, text, progress indicators)
    renderNodeVisuals(nodeGroups, selectedMilestone);
  }, [milestones, selectedMilestone, createHierarchy, onMilestoneClick]);

  useEffect(() => {
    renderTree();
  }, [renderTree]);

  return (
    <svg ref={svgRef} className="w-full h-full">
      <g ref={gRef}></g>
    </svg>
  );
}

export default D3TreeVisualization;
