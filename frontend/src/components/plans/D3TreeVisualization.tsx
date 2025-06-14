import { useRef } from 'react';
import * as d3 from 'd3';
import { useCallback, useEffect, useState } from 'react';
import { Milestone } from '../../types/plan';

interface D3TreeVisualizationProps {
  milestones: Record<string, Milestone>;
  onMilestoneClick: (id: string) => void;
  selectedMilestone: string | null;
  onEditMilestone?: (id: string) => void;
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

const D3TreeVisualization = ({ 
  milestones, 
  onMilestoneClick, 
  selectedMilestone,
  onEditMilestone 
}: D3TreeVisualizationProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);
  
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

  // Setup zoom behavior
  const setupZoom = useCallback(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    
    // Define zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])  // Set min/max zoom scale
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
        setZoomTransform(event.transform);
      });
    
    // Apply zoom behavior to SVG
    svg.call(zoom);
    
    // Add zoom controls
    const zoomControlsContainer = svg.append('g')
      .attr('class', 'zoom-controls')
      .attr('transform', 'translate(20, 20)');
    
    // Add zoom in button
    zoomControlsContainer.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 30)
      .attr('height', 30)
      .attr('rx', 5)
      .attr('fill', 'white')
      .attr('stroke', '#cbd5e1')
      .style('cursor', 'pointer')
      .on('click', () => {
        zoom.scaleBy(svg.transition().duration(300), 1.3);
      });
    
    zoomControlsContainer.append('text')
      .attr('x', 15)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#0f172a')
      .style('font-size', '18px')
      .style('pointer-events', 'none')
      .text('+');
    
    // Add zoom out button
    zoomControlsContainer.append('rect')
      .attr('x', 0)
      .attr('y', 40)
      .attr('width', 30)
      .attr('height', 30)
      .attr('rx', 5)
      .attr('fill', 'white')
      .attr('stroke', '#cbd5e1')
      .style('cursor', 'pointer')
      .on('click', () => {
        zoom.scaleBy(svg.transition().duration(300), 0.7);
      });
    
    zoomControlsContainer.append('text')
      .attr('x', 15)
      .attr('y', 60)
      .attr('text-anchor', 'middle')
      .attr('fill', '#0f172a')
      .style('font-size', '22px')
      .style('pointer-events', 'none')
      .text('-');
      
    // Add fit button
    zoomControlsContainer.append('rect')
      .attr('x', 0)
      .attr('y', 80)
      .attr('width', 30)
      .attr('height', 30)
      .attr('rx', 5)
      .attr('fill', 'white')
      .attr('stroke', '#cbd5e1')
      .style('cursor', 'pointer')
      .on('click', () => {
        // Fit view to content
        if (!svgRef.current || !gRef.current) return;
        
        const svgRect = svgRef.current.getBoundingClientRect();
        const gNode = gRef.current;
        const gBounds = gNode.getBBox();
        
        // Calculate scale to fit the content
        const scale = Math.min(
          0.9 * svgRect.width / gBounds.width,
          0.9 * svgRect.height / gBounds.height
        );
        
        // Calculate translation to center the content
        const translateX = (svgRect.width / 2) - ((gBounds.x + gBounds.width / 2) * scale);
        const translateY = (svgRect.height / 2) - ((gBounds.y + gBounds.height / 2) * scale);
        
        // Apply the transform
        svg.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale));
      });
    
    zoomControlsContainer.append('text')
      .attr('x', 15)
      .attr('y', 100)
      .attr('text-anchor', 'middle')
      .attr('fill', '#0f172a')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .text('⤢');
      
    // Add reset button
    zoomControlsContainer.append('rect')
      .attr('x', 0)
      .attr('y', 120)
      .attr('width', 30)
      .attr('height', 30)
      .attr('rx', 5)
      .attr('fill', 'white')
      .attr('stroke', '#cbd5e1')
      .style('cursor', 'pointer')
      .on('click', () => {
        // Reset to default view
        svg.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity);
      });
    
    zoomControlsContainer.append('text')
      .attr('x', 15)
      .attr('y', 140)
      .attr('text-anchor', 'middle')
      .attr('fill', '#0f172a')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .text('⟲');
      
    return zoom;
  }, []);

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
    
    // Add edit icons for selected milestone
    if (onEditMilestone) {
      nodeGroups
        .filter(d => d.data.id === selectedId)
        .append('g')
        .attr('class', 'edit-icon')
        .attr('transform', 'translate(65, -25)')
        .style('cursor', 'pointer')
        .on('click', (event, d) => {
          event.stopPropagation(); // Prevent triggering the node click event
          if (onEditMilestone) {
            onEditMilestone(d.data.id);
          }
        })
        .each(function() {
          // Create edit icon (pencil) background
          d3.select(this)
            .append('circle')
            .attr('r', 12)
            .attr('fill', 'white')
            .attr('stroke', '#3b82f6')
            .attr('stroke-width', 1.5);
          
          // Create edit icon (pencil icon)
          d3.select(this)
            .append('path')
            .attr('d', 'M12,2C6.47,2,2,6.47,2,12s4.47,10,10,10s10-4.47,10-10S17.53,2,12,2z M9,17v-2.5l5.5-5.5l2.5,2.5L11.5,17H9z M16.5,10.5l-2.5-2.5l1.5-1.5l2.5,2.5L16.5,10.5z')
            .attr('transform', 'scale(0.7) translate(-12, -12)')
            .attr('fill', '#3b82f6');

          // Add tooltip
          d3.select(this)
            .append('title')
            .text('Edit milestone');
        });
    }
  };

  // D3 rendering logic
  const renderTree = useCallback(() => {
    if (!svgRef.current || !gRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    
    // Clear previous content
    g.selectAll("*").remove();
    svg.selectAll(".zoom-controls").remove();

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
    
    // Setup zoom functionality
    setupZoom();
    
    // Center the visualization initially
    if (nodes.length > 0) {
      setTimeout(() => {
        const svgNode = svgRef.current;
        const gNode = gRef.current;
        if (!svgNode || !gNode) return;
        
        const svgRect = svgNode.getBoundingClientRect();
        const gBounds = gNode.getBBox();
        
        // Calculate scale to fit the content
        const scale = Math.min(
          0.9 * svgRect.width / gBounds.width,
          0.9 * svgRect.height / gBounds.height
        );
        
        // Calculate translation to center the content
        const translateX = (svgRect.width / 2) - ((gBounds.x + gBounds.width / 2) * scale);
        const translateY = (svgRect.height / 2) - ((gBounds.y + gBounds.height / 2) * scale);
        
        // Apply the transform
        const zoom = d3.zoom<SVGSVGElement, unknown>().on('zoom', event => {
          g.attr('transform', event.transform.toString());
        });
        
        d3.select(svgNode)
          .transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale));
      }, 100);
    }
  }, [milestones, selectedMilestone, createHierarchy, onMilestoneClick, setupZoom]);

  useEffect(() => {
    renderTree();
  }, [renderTree]);

  // Add mouse wheel zoom instruction
  const instructions = (
    <div className="absolute bottom-4 left-4 bg-white p-2 rounded-md shadow-sm text-xs text-gray-600">
      <p>⚙️ Pan: Click and drag</p>
      <p>🔍 Zoom: Mouse wheel or use controls</p>
      <p>✏️ Edit: Click a milestone, then the edit icon</p>
    </div>
  );

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full">
        <g ref={gRef}></g>
      </svg>
      {instructions}
    </div>
  );
}

export default D3TreeVisualization;
