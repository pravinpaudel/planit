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

  // Helper function to calculate time left until deadline
  const calculateTimeLeft = (deadline: string): string => {
    if (!deadline) return '';
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    
    // If deadline is invalid, return empty string
    if (isNaN(deadlineDate.getTime())) return '';
    
    // Calculate difference in days
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  // Render node visuals (cards, text, progress indicators)
  const renderNodeVisuals = (
    nodeGroups: d3.Selection<SVGGElement, d3.HierarchyPointNode<Milestone>, SVGGElement, unknown>,
    selectedId: string | null
  ) => {
    // Add drop shadow filter for modern card effect
    const defs = d3.select(svgRef.current).append("defs");
    
    // Create drop shadow
    const filter = defs.append("filter")
      .attr("id", "card-shadow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    filter.append("feDropShadow")
      .attr("dx", "0")
      .attr("dy", "2")
      .attr("stdDeviation", "4")
      .attr("flood-opacity", "0.15")
      .attr("flood-color", "#000");
    
    // Create gradient backgrounds for progress bars
    const progressGradients = {
      'completed': defs.append("linearGradient").attr("id", "progress-completed"),
      'inProgress': defs.append("linearGradient").attr("id", "progress-in-progress"),
      'atRisk': defs.append("linearGradient").attr("id", "progress-at-risk"),
      'delayed': defs.append("linearGradient").attr("id", "progress-delayed"),
    };
    
    // Green gradient for completed
    progressGradients.completed
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%");
    progressGradients.completed.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#22c55e");
    progressGradients.completed.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#4ade80");
    
    // Blue gradient for in progress
    progressGradients.inProgress
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%");
    progressGradients.inProgress.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3b82f6");
    progressGradients.inProgress.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#60a5fa");
    
    // Amber gradient for at risk
    progressGradients.atRisk
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%");
    progressGradients.atRisk.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#f59e0b");
    progressGradients.atRisk.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#fbbf24");
    
    // Red gradient for delayed
    progressGradients.delayed
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%");
    progressGradients.delayed.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ef4444");
    progressGradients.delayed.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#f87171");

    // Virtual root node styling (plan title)
    const virtualRootNodes = nodeGroups.filter(d => d.data.id === 'virtual-root');
    
    // Add card background for virtual root
    virtualRootNodes.append('rect')
      .attr('width', 200)
      .attr('height', 70)
      .attr('x', -100)
      .attr('y', -35)
      .attr('rx', 10)
      .attr('fill', '#f1f5f9')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 1)
      .attr('filter', 'url(#card-shadow)');
    
    // Add title for virtual root
    virtualRootNodes.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#334155')
      .text(d => d.data.title || 'Project Plan');
    
    // No 'P' icon added to virtual root as requested

    // Regular milestone nodes (not the virtual root)
    const milestoneNodes = nodeGroups.filter(d => d.data.id !== 'virtual-root');
    
    // Create card-style nodes for milestones - even smaller size
    milestoneNodes.append('rect')
      .attr('class', 'milestone-card')
      .attr('width', 160) // Reduced width further
      .attr('height', 70) // Reduced height even more
      .attr('x', -80) // Adjusted x position
      .attr('y', -35) // Adjusted y position
      .attr('rx', 8) // Rounded corners
      .attr('fill', d => d.data.id === selectedId ? '#f9fafb' : 'white')
      .attr('filter', 'url(#card-shadow)')
      .attr('stroke', d => {
        if (d.data.id === selectedId) {
          const status = d.data.status || (d.data.isComplete ? 'COMPLETED' : 'NOT_STARTED');
          switch(status) {
            case 'COMPLETED': return '#22c55e';     // Green
            case 'IN_PROGRESS': return '#3b82f6';   // Blue
            case 'AT_RISK': return '#f59e0b';       // Amber/Orange
            case 'DELAYED': return '#ef4444';       // Red
            default: return '#94a3b8';              // Gray
          }
        }
        return '#e2e8f0';
      })
      .attr('stroke-width', d => d.data.id === selectedId ? 2 : 1);
    
    // Add colored bar INSIDE the card on left side
    milestoneNodes.append('rect')
      .attr('x', -80) // Adjusted to be inside the card
      .attr('y', -35) // Top aligned with card
      .attr('width', 4) // Thinner
      .attr('height', 70) // Full height of card
      .attr('fill', d => {
        const status = d.data.status || (d.data.isComplete ? 'COMPLETED' : 'NOT_STARTED');
        switch(status) {
          case 'COMPLETED': return '#22c55e';     // Green
          case 'IN_PROGRESS': return '#3b82f6';   // Blue
          case 'AT_RISK': return '#f59e0b';       // Amber/Orange
          case 'DELAYED': return '#ef4444';       // Red
          default: return '#94a3b8';              // Gray
        }
      });
    
    // Add milestone title with text truncation
    milestoneNodes.append('text')
      .attr('x', -70) // Adjusted for smaller card and to account for color bar
      .attr('y', -15) // Adjusted for smaller card
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '13px') // Even smaller font for compact design
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .each(function(d) {
        const title = d.data.title || 'Untitled';
        const maxLength = 18; // Shorter truncation for smaller cards
        const text = title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
        d3.select(this).text(text);
      });
    
    // Show progress bar for IN_PROGRESS milestones and time left for NOT_STARTED
    milestoneNodes.each(function(d) {
      const node = d3.select(this);
      const status = d.data.status || (d.data.isComplete ? 'COMPLETED' : 'NOT_STARTED');
      
      if (status === 'IN_PROGRESS') {
        // Add progress bar background only for IN_PROGRESS milestones
        node.append('rect')
          .attr('x', -70) // Adjusted for smaller card and color bar
          .attr('y', 2) // Slightly below title
          .attr('width', 120) // Adjusted for smaller card
          .attr('height', 3) // Thinner progress bar
          .attr('rx', 1.5) // Smaller rounded corners
          .attr('fill', '#e2e8f0');
          
        // Add progress bar fill
        node.append('rect')
          .attr('x', -70) // Adjusted for smaller card and color bar
          .attr('y', 2) // Slightly below title
          .attr('width', 60) // 50% for IN_PROGRESS
          .attr('height', 3) // Thinner progress bar
          .attr('rx', 1.5) // Smaller rounded corners
          .attr('fill', 'url(#progress-in-progress)');
          
        // Add progress percentage text
        node.append('text')
          .attr('x', 50) // Adjusted for smaller card
          .attr('y', 2) // Aligned with progress bar
          .attr('text-anchor', 'end')
          .attr('dominant-baseline', 'central')
          .attr('font-size', '10px') // Smaller font
          .attr('font-weight', 'medium')
          .attr('fill', '#64748b')
          .text('50%');
      } else if (status === 'NOT_STARTED' && d.data.deadline) {
        // For NOT_STARTED milestones, show time left until deadline
        const timeLeft = calculateTimeLeft(d.data.deadline);
        if (timeLeft) {
          node.append('text')
            .attr('x', 0) // Centered in the card
            .attr('y', 2) // Same position as progress bar would be
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', '10px')
            .attr('font-weight', 'medium')
            .attr('fill', '#64748b')
            .text(`⏱ ${timeLeft}`); // Clock emoji + time left
        }
      }
    });
    
    // Add status badges - smaller and contained within card
    milestoneNodes.append('rect')
      .attr('x', -70) // Adjusted for smaller card and color bar
      .attr('y', 15) // Adjusted for smaller card
      .attr('width', d => {
        const status = d.data.status || (d.data.isComplete ? 'COMPLETED' : 'NOT_STARTED');
        switch(status) {
          case 'COMPLETED': return 60; // Smaller width
          case 'IN_PROGRESS': return 70; // Smaller width
          case 'AT_RISK': return 50; // Smaller width
          case 'DELAYED': return 50; // Smaller width
          default: return 65; // Smaller width
        }
      })
      .attr('height', 16) // Much smaller height
      .attr('rx', 8) // Smaller rounded corners
      .attr('fill', d => {
        const status = d.data.status || (d.data.isComplete ? 'COMPLETED' : 'NOT_STARTED');
        switch(status) {
          case 'COMPLETED': return '#dcfce7';    // Light green
          case 'IN_PROGRESS': return '#dbeafe';  // Light blue
          case 'AT_RISK': return '#fef3c7';      // Light amber
          case 'DELAYED': return '#fee2e2';      // Light red
          default: return '#f1f5f9';             // Light gray
        }
      });
      
    // Add status text - smaller and positioned correctly
    milestoneNodes.append('text')
      .attr('x', d => {
        const status = d.data.status || (d.data.isComplete ? 'COMPLETED' : 'NOT_STARTED');
        switch(status) {
          case 'COMPLETED': return -40;
          case 'IN_PROGRESS': return -35;
          case 'AT_RISK': return -45;
          case 'DELAYED': return -45;
          default: return -37.5;
        }
      })
      .attr('y', 23) // Adjusted for smaller card
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '9px') // Even smaller font for smaller badge
      .attr('font-weight', '500')
      .attr('fill', d => {
        const status = d.data.status || (d.data.isComplete ? 'COMPLETED' : 'NOT_STARTED');
        switch(status) {
          case 'COMPLETED': return '#166534';    // Dark green
          case 'IN_PROGRESS': return '#1e40af';  // Dark blue
          case 'AT_RISK': return '#854d0e';      // Dark amber
          case 'DELAYED': return '#b91c1c';      // Dark red
          default: return '#475569';             // Dark gray
        }
      })
      .text(d => {
        const status = d.data.status || (d.data.isComplete ? 'COMPLETED' : 'NOT_STARTED');
        switch(status) {
          case 'COMPLETED': return 'completed';
          case 'IN_PROGRESS': return 'in progress';
          case 'AT_RISK': return 'at risk';
          case 'DELAYED': return 'delayed';
          default: return 'not started';
        }
      });
    
    // We removed calendar icon and deadline display as requested
      
    // Add edit icons for selected milestone (but NOT for virtual root)
    if (onEditMilestone) {
      nodeGroups
        .filter(d => d.data.id === selectedId && d.data.id !== 'virtual-root')
        .append('g')
        .attr('class', 'edit-icon')
        .attr('transform', 'translate(95, -55)')
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
            .attr('r', 14)
            .attr('fill', 'white')
            .attr('stroke', '#3b82f6')
            .attr('stroke-width', 1.5)
            .attr('filter', 'url(#card-shadow)');
          
          // Create edit icon (pencil icon)
          d3.select(this)
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', '14px')
            .attr('fill', '#3b82f6')
            .text('✎');

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
    // Further increase spacing to prevent node overlapping
    const treeLayout = d3.tree<Milestone>()
      .size([containerWidth * 0.95, containerHeight * 0.7]) // Use maximum horizontal space
      .separation((a, b) => (a.parent === b.parent ? 4.5 : 6.0)); // Extremely increased horizontal separation to prevent overlapping milestones

    const root = treeLayout(hierarchy);

    // Render links - now including links from virtual root
    const links = root.links();
    
    // Create arrow markers for link ends
    const defs = g.append('defs');
    
    // Arrow for completed milestones
    defs.append('marker')
      .attr('id', 'arrowhead-green')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 5)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#22c55e');
    
    // Arrow for in-progress milestones
    defs.append('marker')
      .attr('id', 'arrowhead-blue')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 5)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#3b82f6');
    
    // Add gradients for links
    const linkGradient = defs.append('linearGradient')
      .attr('id', 'link-gradient')
      .attr('gradientUnits', 'userSpaceOnUse');
    
    linkGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#94a3b8');
    
    linkGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#cbd5e1');
    
    // Create modern styled links
    g.selectAll('.link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkVertical<d3.HierarchyPointLink<Milestone>, d3.HierarchyPointNode<Milestone>>()
        .x(d => d.x)
        .y(d => d.y))
      .attr('fill', 'none')
      .attr('stroke', d => {
        if (d.source.data.id === 'virtual-root') return 'url(#link-gradient)';
        
        const status = d.target.data.status || (d.target.data.isComplete ? 'COMPLETED' : 'NOT_STARTED');
        switch(status) {
          case 'COMPLETED': return '#22c55e';     // Green
          case 'IN_PROGRESS': return '#3b82f6';   // Blue
          case 'AT_RISK': return '#f59e0b';       // Amber
          case 'DELAYED': return '#ef4444';       // Red
          default: return '#94a3b8';              // Gray
        }
      })
      .attr('stroke-width', d => d.source.data.id === 'virtual-root' ? 1.5 : 2)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-dasharray', d => {
        if (d.source.data.id === 'virtual-root') return '5,5';
        
        const status = d.target.data.status || (d.target.data.isComplete ? 'COMPLETED' : 'NOT_STARTED');
        switch(status) {
          case 'DELAYED': return '5,5'; // Dashed line for delayed
          case 'AT_RISK': return '10,3'; // Different dash pattern for at risk
          default: return 'none';
        }
      })
      .attr('opacity', d => d.source.data.id === 'virtual-root' ? 0.7 : 0.8)
      .attr('marker-end', d => {
        if (d.source.data.id === 'virtual-root') return '';
        
        const status = d.target.data.status || (d.target.data.isComplete ? 'COMPLETED' : 'NOT_STARTED');
        switch(status) {
          case 'COMPLETED': return 'url(#arrowhead-green)';
          case 'IN_PROGRESS': return 'url(#arrowhead-blue)';
          default: return '';
        }
      });

    // Render all nodes including virtual root
    const nodes = root.descendants();

    const nodeGroups = g.selectAll<SVGGElement, d3.HierarchyPointNode<Milestone>>('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', 'default') // Absolutely ensure no pointer cursor for any nodes
      .on('click', (event, d) => {
        // Only trigger for normal milestones, not for virtual root
        if (d.data.id !== 'virtual-root') {
          event.stopPropagation();
          onMilestoneClick(d.data.id);
        }
      })
      .on('mouseover', null) // Remove any mouseover events
      .on('mouseout', null); // Remove any mouseout events

    // Add node visuals (rectangles, text, progress indicators)
    renderNodeVisuals(nodeGroups, selectedMilestone);
    
    // Setup zoom functionality
    const zoom = setupZoom();
    
    // Add fullscreen button - position adjusted based on mode
    const fullscreenControlContainer = svg.append('g')
      .attr('class', 'zoom-controls')
      .attr('transform', `translate(${containerWidth - 120}, 20)`); // Reset to original position
    
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
    
    // Fullscreen icon - using standard fullscreen/minimize SVG icons
    // if (isFullScreen) {
    //   // Exit fullscreen icon (minimize)
    //   const minimizeIcon = fullscreenControlContainer.append('g');
      
    //   // Draw the minimize fullscreen icon (corners pointing inward)
    //   // Top-left corner
    //   minimizeIcon.append('path')
    //     .attr('d', 'M15,9 L9,9 L9,15')
    //     .attr('fill', 'none')
    //     .attr('stroke', '#3b82f6')
    //     .attr('stroke-width', 1.5)
    //     .attr('stroke-linecap', 'round')
    //     .attr('stroke-linejoin', 'round');
      
    //   // Top-right corner
    //   minimizeIcon.append('path')
    //     .attr('d', 'M15,9 L21,9 L21,15')
    //     .attr('fill', 'none')
    //     .attr('stroke', '#3b82f6')
    //     .attr('stroke-width', 1.5)
    //     .attr('stroke-linecap', 'round')
    //     .attr('stroke-linejoin', 'round');
      
    //   // Bottom-left corner
    //   minimizeIcon.append('path')
    //     .attr('d', 'M9,15 L9,21 L15,21')
    //     .attr('fill', 'none')
    //     .attr('stroke', '#3b82f6')
    //     .attr('stroke-width', 1.5)
    //     .attr('stroke-linecap', 'round')
    //     .attr('stroke-linejoin', 'round');
      
    //   // Bottom-right corner
    //   minimizeIcon.append('path')
    //     .attr('d', 'M21,15 L21,21 L15,21')
    //     .attr('fill', 'none')
    //     .attr('stroke', '#3b82f6')
    //     .attr('stroke-width', 1.5)
    //     .attr('stroke-linecap', 'round')
    //     .attr('stroke-linejoin', 'round');
    // } else {
    //   // Enter fullscreen icon (maximize)
    //   const maximizeIcon = fullscreenControlContainer.append('g');
      
    //   // Draw the maximize fullscreen icon (corners pointing outward)
    //   // Top-left corner
    //   maximizeIcon.append('path')
    //     .attr('d', 'M9,15 L9,9 L15,9')
    //     .attr('fill', 'none')
    //     .attr('stroke', '#475569')
    //     .attr('stroke-width', 1.5)
    //     .attr('stroke-linecap', 'round')
    //     .attr('stroke-linejoin', 'round');
      
    //   // Top-right corner
    //   maximizeIcon.append('path')
    //     .attr('d', 'M15,9 L21,9 L21,15')
    //     .attr('fill', 'none')
    //     .attr('stroke', '#475569')
    //     .attr('stroke-width', 1.5)
    //     .attr('stroke-linecap', 'round')
    //     .attr('stroke-linejoin', 'round');
      
    //   // Bottom-left corner
    //   maximizeIcon.append('path')
    //     .attr('d', 'M9,15 L9,21 L15,21')
    //     .attr('fill', 'none')
    //     .attr('stroke', '#475569')
    //     .attr('stroke-width', 1.5)
    //     .attr('stroke-linecap', 'round')
    //     .attr('stroke-linejoin', 'round');
      
    //   // Bottom-right corner
    //   maximizeIcon.append('path')
    //     .attr('d', 'M15,21 L21,21 L21,15')
    //     .attr('fill', 'none')
    //     .attr('stroke', '#475569')
    //     .attr('stroke-width', 1.5)
    //     .attr('stroke-linecap', 'round')
    //     .attr('stroke-linejoin', 'round');
    // }

   if (isFullScreen) {
  // Minimize icon - single path
  const minimizeIcon = fullscreenControlContainer.append('g');
    // Top-left arrow
  minimizeIcon.append('path')
    .attr('d', 'M8 3v5a2 2 0 0 0 2 2h5')
    .attr('fill', 'none')
    .attr('stroke', '#3b82f6')
    .attr('stroke-width', 1.5)
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round');
    
  // Top-left arrowhead
  minimizeIcon.append('path')
    .attr('d', 'M3 3l5 5')
    .attr('fill', 'none')
    .attr('stroke', '#3b82f6')
    .attr('stroke-width', 1.5)
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round');
    
  // Bottom-right arrow
  minimizeIcon.append('path')
    .attr('d', 'M16 21v-5a2 2 0 0 1 2-2h5')
    .attr('fill', 'none')
    .attr('stroke', '#3b82f6')
    .attr('stroke-width', 1.5)
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round');
    
  // Bottom-right arrowhead
  minimizeIcon.append('path')
    .attr('d', 'M21 21l-5-5')
    .attr('fill', 'none')
    .attr('stroke', '#3b82f6')
    .attr('stroke-width', 1.5)
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round');
} else {
  // Maximize icon - single path  
  fullscreenControlContainer.append('path')
    .attr('d', 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3')
    .attr('fill', 'none')
    .attr('stroke', '#475569')
    .attr('stroke-width', 1.5)
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round');
}
    
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
      {/* <p className="font-medium mb-1">📋 Roadmap Controls</p>
      <p>⚙️ <span className="font-medium">Pan:</span> Click and drag</p>
      <p>🔍 <span className="font-medium">Zoom:</span> Mouse wheel or use controls</p>
      <p>✏️ <span className="font-medium">Edit:</span> Click milestone, then edit icon</p>
      <p>📺 <span className="font-medium">Full Screen:</span> {isFullScreen ? "Press ESC or click icon" : "Click icon in top-right"}</p> */}
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
      style={isFullScreen ? { padding: '10px' } : undefined} // Add padding in fullscreen mode
    >
      <svg ref={svgRef} className={`w-full h-full ${isFullScreen ? 'rounded-md shadow-sm' : ''}`}>
        <g ref={gRef}></g>
      </svg>
      {instructions}
    </div>
  );
}

export default D3TreeVisualization;
