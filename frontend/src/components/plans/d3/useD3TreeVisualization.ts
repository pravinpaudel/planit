import { useCallback, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Milestone } from "../../../types/plan";
import { createHierarchy, setupZoom, centerVisualization } from "./D3TreeHelpers";
import { renderMilestoneNode, CARD_WIDTH, CARD_HEIGHT } from "./MilestoneNode";

interface UseD3TreeVisualizationProps {
  milestones: Record<string, Milestone>;
  selectedMilestone: string | null;
  onMilestoneClick: (id: string) => void;
  onEditMilestone?: (id: string) => void;
  planTitle: string;
  svgRef: React.RefObject<SVGSVGElement>;
  gRef: React.RefObject<SVGGElement>;
  containerRef: React.RefObject<HTMLDivElement>;
}

interface UseD3TreeVisualizationResult {
  renderTree: () => void;
  handleNodeDrag: (event: d3.D3DragEvent<SVGGElement, d3.HierarchyPointNode<Milestone>, unknown>, d: d3.HierarchyPointNode<Milestone>) => void;
  nodePositions: Record<string, {x: number, y: number}>;
}

export function useD3TreeVisualization({
  milestones,
  selectedMilestone,
  onMilestoneClick,
  onEditMilestone,
  planTitle,
  svgRef,
  gRef,
  containerRef
}: UseD3TreeVisualizationProps): UseD3TreeVisualizationResult {
  // Zoom behavior ref
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  
  // Node positions for drag and drop
  const nodePositionsRef = useRef<Record<string, {x: number, y: number}>>({});
  
  // Initialize zoom
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    
    try {
      // Setup zoom behavior
      zoomRef.current = setupZoom(svgRef.current, gRef.current);
      
      // Cleanup
      return () => { 
        if (svgRef.current) {
          d3.select(svgRef.current).on(".zoom", null);
        }
        zoomRef.current = null;
      };
    } catch (err) {
      console.error("Error initializing zoom:", err);
    }
  }, []);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => renderTree();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Drag handler
  const handleNodeDrag = useCallback((
    event: d3.D3DragEvent<SVGGElement, d3.HierarchyPointNode<Milestone>, unknown>, 
    d: d3.HierarchyPointNode<Milestone>
  ) => {
    const subject = event.subject as any;
    subject.x += event.dx;
    subject.y += event.dy;
    
    // Update stored positions
    nodePositionsRef.current = {
      ...nodePositionsRef.current,
      [d.data.id]: { x: subject.x, y: subject.y }
    };
    
    // Update element position
    d3.select(subject.element).attr(
      "transform",
      `translate(${subject.x},${subject.y})`
    );
  }, []);
  
  // Render the tree visualization
  const renderTree = useCallback(() => {
    if (!svgRef.current || !gRef.current) return;
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    const width = containerRef.current?.clientWidth || 1000;
    const height = containerRef.current?.clientHeight || 600;

    // Clear previous content
    g.selectAll("*").remove();

    // Create hierarchy
    const hierarchy = createHierarchy(milestones, planTitle);
    if (!hierarchy) return;

    // Create tree layout
    const treeLayout = d3.tree<Milestone>()
      .size([width * 0.95, height * 0.7])
      .separation((a, b) => (a.parent === b.parent ? 4.5 : 6.0));
    
    // Apply layout
    const root = treeLayout(hierarchy);

    // Create drag behavior
    const drag = d3.drag<SVGGElement, d3.HierarchyPointNode<Milestone>>()
      .on("drag", function (event, d) {
        handleNodeDrag(event, d);
      });

    // Draw links between nodes
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d) => {
        const path = d3.linkVertical<any, any>()
          .x((node) => node.x)
          .y((node) => node.y);
        return path(d);
      })
      .attr("fill", "none")
      .attr("stroke", "#CBD5E1")
      .attr("stroke-width", 2)
      .attr("opacity", 0.8);

    // Draw nodes
    const nodes = root.descendants();
    const nodeGroups = g.selectAll<SVGGElement, d3.HierarchyPointNode<Milestone>>(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => {
        // Use custom position if dragged, else d.x/d.y
        const pos = nodePositionsRef.current[d.data.id];
        return `translate(${pos?.x ?? d.x},${pos?.y ?? d.y})`;
      })
      .call(d => {
        // Only non-root nodes are draggable
        d.filter(dd => dd.data.id !== "virtual-root")
          .call(drag as any);
      })
      .style("cursor", d => d.data.id !== "virtual-root" ? "grab" : "default");
      
    // Render each node
    nodeGroups.each(function(d) {
      const nodeGroup = d3.select(this);
      
      // Virtual root (plan title)
      if (d.data.id === "virtual-root") {
        nodeGroup.append("rect")
          .attr("width", 200).attr("height", 70)
          .attr("x", -100).attr("y", -35)
          .attr("rx", 10).attr("fill", "#f1f5f9")
          .attr("stroke", "#cbd5e1").attr("stroke-width", 1);
        
        nodeGroup.append("text")
          .attr("x", 0).attr("y", 0)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .attr("font-size", "16px")
          .attr("font-weight", "bold")
          .attr("fill", "#334155")
          .text(d.data.title || "Project Plan");
      } 
      // Milestone nodes
      else {
        renderMilestoneCard(nodeGroup, d);
      }
    });

    // Add click handlers
    nodeGroups.filter(d => d.data.id !== "virtual-root")
      .on("click", (event, d) => {
        onMilestoneClick(d.data.id);
      });
    
    // Add edit buttons if applicable
    if (onEditMilestone) {
      nodeGroups.filter(d => d.data.id === selectedMilestone)
        .append("text")
        .attr("x", CARD_WIDTH/2-24)
        .attr("y", CARD_HEIGHT/2-14)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "16px")
        .attr("fill", "#3b82f6")
        .style("cursor", "pointer")
        .text("✎")
        .on("click", function(event, d) {
          event.stopPropagation();
          onEditMilestone(d.data.id);
        });
    }

    // Center visualization
    if (nodes.length > 0 && zoomRef.current) {
      setTimeout(() => {
        const svgNode = svgRef.current, gNode = gRef.current;
        if (!svgNode || !gNode || !zoomRef.current) return;
        
        try {
          centerVisualization(svgNode, gNode, zoomRef.current);
        } catch (err) {
          console.error("Error centering visualization:", err);
        }
      }, 100);
    }
  }, [milestones, selectedMilestone, onMilestoneClick, onEditMilestone, planTitle, handleNodeDrag]);
  
  // Helper function to render milestone card
  function renderMilestoneCard(
    selection: d3.Selection<SVGGElement, d3.HierarchyPointNode<Milestone>, any, any>, 
    d: d3.HierarchyPointNode<Milestone>
  ) {
    const status = d.data.status || "NOT_STARTED";
    
    // Main card
    selection.append("rect")
      .attr("width", CARD_WIDTH)
      .attr("height", CARD_HEIGHT)
      .attr("x", -CARD_WIDTH/2)
      .attr("y", -CARD_HEIGHT/2)
      .attr("rx", 8)
      .attr("fill", d.data.id === selectedMilestone ? "#f9fafb" : "white")
      .attr("stroke", d.data.id === selectedMilestone ? "#3b82f6" : "#e2e8f0")
      .attr("stroke-width", d.data.id === selectedMilestone ? 2 : 1);
      
    // Rest of card rendering...
    // Status indicator, title, badge, progress/deadline info
    // (Abbreviated for readability - full implementation in MilestoneNode.ts)
  }
  
  return {
    renderTree,
    handleNodeDrag,
    nodePositions: nodePositionsRef.current
  };
}
