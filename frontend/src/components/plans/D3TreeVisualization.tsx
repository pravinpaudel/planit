import { useRef } from 'react';
import * as d3 from 'd3';
import { useCallback, useEffect, useState } from 'react';
import { Milestone } from '../../types/plan';

interface D3TreeVisualizationProps {
  milestones: Record<string, Milestone>;
  onMilestoneClick: (id: string) => void;
  selectedMilestone: string | null;
  onEditMilestone?: (id: string) => void;
  planTitle?: string; // Add plan title prop
}

// Interface that combines Milestone properties with hierarchy structure for D3
interface HierarchyData {
  id: string;
  title: string;
  description: string;
  taskId: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string | null;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'AT_RISK' | 'DELAYED' | 'NOT_STARTED';
  isComplete?: boolean; // Legacy field for backward compatibility
  children?: HierarchyData[];
}

const D3TreeVisualization = ({ 
  milestones, 
  onMilestoneClick, 
  selectedMilestone,
  onEditMilestone,
  planTitle = 'Project Plan' // Default title if none provided
}: D3TreeVisualizationProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Find root nodes (nodes without parents or with null parentId)
  const findRootNodes = useCallback((milestones: Record<string, Milestone>): string[] => {
    return Object.keys(milestones).filter(id => {
      const milestone = milestones[id];
      return !milestone.parentId || milestone.parentId === null;
    });
  }, []);    // Create D3 hierarchy from milestone data
  const createHierarchy = useCallback(() => {
    const rootNodes = findRootNodes(milestones);
    
    if (rootNodes.length === 0) return null;
    
    // Always create a virtual root with plan title, regardless of number of root nodes
    const virtualRoot: Milestone = {
      id: 'virtual-root',
      title: planTitle,
      description: '',
      taskId: '',
      status: 'NOT_STARTED',  // Virtual root status
      deadline: '',
      createdAt: '',
      updatedAt: '',
      children: rootNodes.map(id => buildHierarchicalData(id, milestones))
    };
    return d3.hierarchy(virtualRoot);
  }, [milestones, findRootNodes, planTitle]);

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
        status: 'NOT_STARTED',
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
        status: 'NOT_STARTED',
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

  // Full screen toggle handler
  const toggleFullScreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!isFullScreen) {
      // Enter fullscreen mode
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
          .then(() => setIsFullScreen(true))
          .catch(err => console.error(`Error attempting to enable full-screen mode: ${err.message}`));
      } else if ((containerRef.current as any).webkitRequestFullscreen) { /* Safari */
        (containerRef.current as any).webkitRequestFullscreen();
        setIsFullScreen(true);
      } else if ((containerRef.current as any).msRequestFullscreen) { /* IE11 */
        (containerRef.current as any).msRequestFullscreen();
        setIsFullScreen(true);
      }
    } else {
      // Exit fullscreen mode
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => setIsFullScreen(false))
          .catch(err => console.error(`Error attempting to exit full-screen mode: ${err.message}`));
      } else if ((document as any).webkitExitFullscreen) { /* Safari */
        (document as any).webkitExitFullscreen();
        setIsFullScreen(false);
      } else if ((document as any).msExitFullscreen) { /* IE11 */
        (document as any).msExitFullscreen();
        setIsFullScreen(false);
      }
    }
  }, [isFullScreen]);
  
  // Listen for fullscreen change events and handle ESC key
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(Boolean(
        document.fullscreenElement || 
        (document as any).webkitFullscreenElement || 
        (document as any).msFullscreenElement
      ));
    };
    
    // Handle ESC key to exit fullscreen
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullScreen) {
        // We don't need to call exitFullscreen here as the browser already does this
        // Just make sure our state is in sync with the browser
        setIsFullScreen(false);
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('msfullscreenchange', handleFullScreenChange);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('msfullscreenchange', handleFullScreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen]);

  // Render node visuals (rectangles, text, progress indicators)
  const renderNodeVisuals = (
    nodeGroups: d3.Selection<SVGGElement, d3.HierarchyPointNode<Milestone>, SVGGElement, unknown>,
    selectedId: string | null
  ) => {
    // Add rectangles for nodes
    nodeGroups
      .append('rect')
      .attr('width', d => d.data.id === 'virtual-root' ? 180 : 150) // Wider for plan title
      .attr('height', 60)
      .attr('x', d => d.data.id === 'virtual-root' ? -90 : -75) // Adjust x position for wider rectangle
      .attr('y', -30)
      .attr('rx', 6)
      .attr('fill', d => {
        if (d.data.id === 'virtual-root') return '#e2e8f0'; // Light gray for plan node
        return d.data.id === selectedId ? '#3b82f6' : '#f8fafc'; // Normal colors for milestones
      })
      .attr('stroke', d => d.data.id === 'virtual-root' ? '#94a3b8' : '#cbd5e1')
      .attr('stroke-width', d => d.data.id === 'virtual-root' ? 1 : 2);

    // Add titles
    nodeGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', d => d.data.id === 'virtual-root' ? '14px' : '12px')
      .attr('font-weight', 'bold')
      .attr('fill', d => {
        if (d.data.id === 'virtual-root') return '#334155'; // Darker color for plan title
        return d.data.id === selectedId ? '#ffffff' : '#0f172a';
      })
      .text(d => d.data.title || 'Untitled');

    // Add plan icon for virtual root
    nodeGroups
      .filter(d => d.data.id === 'virtual-root')
      .append('path')
    //   .attr('d', 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-4H8v-2h4V7h2v4h4v2h-4v4z')
      .attr('transform', 'scale(0.8) translate(-24, -24)')
      .attr('fill', '#475569');

    // Add status indicators for normal milestones
    const statusGroups = nodeGroups
      .filter(d => d.data.id !== 'virtual-root')
      .append('g')
      .attr('class', 'status-indicator');
    
    // Add colored status circle
    statusGroups.append('circle')
      .attr('cx', 60)
      .attr('cy', -22)
      .attr('r', 6)
      .attr('fill', d => {
        // Handle both new status field and legacy isComplete
        const status = d.data.status || (d.data.isComplete ? 'COMPLETED' : 'NOT_STARTED');
        
        switch(status) {
          case 'COMPLETED': return '#22c55e';     // Green
          case 'IN_PROGRESS': return '#3b82f6';   // Blue
          case 'AT_RISK': return '#f59e0b';       // Amber/Orange
          case 'DELAYED': return '#ef4444';       // Red
          case 'NOT_STARTED': 
          default: return '#94a3b8';             // Gray
        }
      });
      
    // Add tooltip with status text
    statusGroups.append('title')
      .text(d => {
        // Format status for display
        const status = d.data.status || (d.data.isComplete ? 'COMPLETED' : 'NOT_STARTED');
        
        switch(status) {
          case 'COMPLETED': return 'Status: Completed';
          case 'IN_PROGRESS': return 'Status: In Progress';
          case 'AT_RISK': return 'Status: At Risk';
          case 'DELAYED': return 'Status: Delayed';
          case 'NOT_STARTED': 
          default: return 'Status: Not Started';
        }
      });
    
    // Add edit icons for selected milestone (but NOT for virtual root)
    if (onEditMilestone) {
      nodeGroups
        .filter(d => d.data.id === selectedId && d.data.id !== 'virtual-root')
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
    
    // Get container dimensions
    const containerWidth = containerRef.current?.clientWidth || 1000;
    const containerHeight = containerRef.current?.clientHeight || 600;
    
    // Clear previous content
    g.selectAll("*").remove();
    svg.selectAll(".zoom-controls").remove();

    const hierarchy = createHierarchy();
    if (!hierarchy) return;

    // Configure tree layout with dynamic size based on container dimensions
    const treeLayout = d3.tree<Milestone>()
      .size([containerWidth * 0.85, containerHeight * 0.85]) // Use container dimensions but leave some space
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.2));

    const root = treeLayout(hierarchy);

    // Render links - now including links from virtual root
    const links = root.links();
    
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
      .attr('stroke-width', d => d.source.data.id === 'virtual-root' ? 1.5 : 2) // Thinner lines from virtual root
      .attr('stroke-dasharray', d => d.source.data.id === 'virtual-root' ? '5,5' : 'none') // Dashed lines from virtual root
      .attr('opacity', d => d.source.data.id === 'virtual-root' ? 0.7 : 1); // Slightly transparent lines from virtual root

    // Render all nodes including virtual root
    const nodes = root.descendants();

    const nodeGroups = g.selectAll<SVGGElement, d3.HierarchyPointNode<Milestone>>('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', d => d.data.id === 'virtual-root' ? 'default' : 'pointer') // No pointer cursor for virtual root
      .on('click', (event, d) => {
        // Only trigger for normal milestones, not for virtual root
        if (d.data.id !== 'virtual-root') {
          event.stopPropagation();
          onMilestoneClick(d.data.id);
        }
      });

    // Add node visuals (rectangles, text, progress indicators)
    renderNodeVisuals(nodeGroups, selectedMilestone);
    
    // Setup zoom functionality
    const zoom = setupZoom();
    
    // Add fullscreen button
    const fullscreenControlContainer = svg.append('g')
      .attr('class', 'zoom-controls')
      .attr('transform', `translate(${containerWidth - 50}, 20)`);
    
    // Add a visual highlight effect if in fullscreen mode
    fullscreenControlContainer.append('rect')
      .attr('x', -2)
      .attr('y', -2)
      .attr('width', 34)
      .attr('height', 34)
      .attr('rx', 7)
      .attr('fill', isFullScreen ? '#e0f2fe' : 'none') // Light blue background when active
      .attr('opacity', 0.7);
    
    // Main button background
    fullscreenControlContainer.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 30)
      .attr('height', 30)
      .attr('rx', 5)
      .attr('fill', 'white')
      .attr('stroke', isFullScreen ? '#3b82f6' : '#cbd5e1') // Blue border when in fullscreen
      .attr('stroke-width', isFullScreen ? 1.5 : 1)
      .style('cursor', 'pointer')
      .on('click', () => {
        toggleFullScreen();
      })
      .on('mouseover', function() {
        d3.select(this).attr('stroke', '#3b82f6');
      })
      .on('mouseout', function() {
        if (!isFullScreen) {
          d3.select(this).attr('stroke', '#cbd5e1');
        }
      });
    
    // Fullscreen icon
    fullscreenControlContainer.append('path')
      .attr('d', isFullScreen 
        ? 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z'  // Exit fullscreen icon
        : 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z'  // Enter fullscreen icon
      )
      .attr('transform', 'translate(5, 5)')
      .attr('fill', isFullScreen ? '#3b82f6' : '#475569'); // Blue icon when in fullscreen
    
    fullscreenControlContainer.append('title')
      .text(isFullScreen ? 'Exit Full Screen (ESC)' : 'Enter Full Screen');
    
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
        if (zoom) {
          d3.select(svgNode)
            .transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale));
        }
      }, 100);
    }
  }, [milestones, selectedMilestone, createHierarchy, onMilestoneClick, setupZoom, isFullScreen, toggleFullScreen]);

  // Re-render when fullscreen state changes
  useEffect(() => {
    // After a short delay, re-render the tree to adjust to the new size
    const timer = setTimeout(() => {
      renderTree();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isFullScreen, renderTree]);

  useEffect(() => {
    renderTree();
  }, [renderTree]);

  // Handle window resize for responsive visualization
  useEffect(() => {
    const handleResize = () => {
      renderTree();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [renderTree]);

  // Add mouse wheel zoom instruction and full screen info
  const instructions = (
    <div className={`absolute bottom-4 left-4 bg-white p-3 rounded-md shadow-md text-xs text-gray-600 ${isFullScreen ? 'opacity-90 hover:opacity-100 transition-opacity' : ''}`}>
      <p className="font-medium mb-1">📋 Roadmap Controls</p>
      <p>⚙️ <span className="font-medium">Pan:</span> Click and drag</p>
      <p>🔍 <span className="font-medium">Zoom:</span> Mouse wheel or use controls</p>
      <p>✏️ <span className="font-medium">Edit:</span> Click milestone, then edit icon</p>
      <p>📺 <span className="font-medium">Full Screen:</span> {isFullScreen ? "Press ESC or click icon" : "Click icon in top-right"}</p>
      <div className="mt-3 pt-2 border-t border-gray-200">
        <p className="font-medium mb-1">📊 Status Legend</p>
        <div className="grid grid-cols-2 gap-x-2">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: '#94a3b8' }}></span> Not Started
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: '#3b82f6' }}></span> In Progress
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: '#22c55e' }}></span> Completed
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: '#f59e0b' }}></span> At Risk
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: '#ef4444' }}></span> Delayed
          </div>
        </div>
      </div>
    </div>
  );

  // Determine CSS classes based on fullscreen state
  const containerClasses = `relative w-full h-full ${isFullScreen ? 'bg-white' : ''}`;

  return (
    <div 
      ref={containerRef} 
      className={containerClasses}
      style={isFullScreen ? { padding: '16px' } : undefined} // Add padding in fullscreen mode
    >
      <svg ref={svgRef} className={`w-full h-full ${isFullScreen ? 'rounded-md shadow-sm' : ''}`}>
        <g ref={gRef}></g>
      </svg>
      {instructions}
    </div>
  );
}

export default D3TreeVisualization;
