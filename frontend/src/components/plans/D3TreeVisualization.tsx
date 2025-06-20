import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Fullscreen } from "lucide-react";
import * as d3 from "d3";
import { Milestone } from "../../types/plan";
import { calculateTimeLeft, createHierarchy, setupZoom, centerVisualization } from "./d3/D3TreeHelpers";
import { CARD_WIDTH, CARD_HEIGHT } from "./d3/MilestoneNode";
import StatusLegend from "./d3/StatusLegend";
import { getStatusColor, getStatusText, MilestoneStatus } from "./planStatusUtils";

interface D3TreeVisualizationProps {
  milestones: Record<string, Milestone>;
  onMilestoneClick: (id: string) => void;
  selectedMilestone: string | null;
  onEditMilestone?: (id: string) => void;
  planTitle?: string;
}

const D3TreeVisualization: React.FC<D3TreeVisualizationProps> = ({
  milestones,
  onMilestoneClick,
  selectedMilestone,
  onEditMilestone,
  planTitle = "Project Plan"
}) => {
  // Refs for DOM elements
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  
  // UI state
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [nodePositions, setNodePositions] = useState<Record<string, {x: number, y: number}>>({});

  // Fullscreen handling
  const toggleFullScreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!isFullScreen) {
      if (containerRef.current.requestFullscreen) containerRef.current.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }, [isFullScreen]);
  
  // Track fullscreen state
  useEffect(() => {
    const handleChange = () => setIsFullScreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  // Node drag handler
  const handleNodeDrag = useCallback((event: d3.D3DragEvent<SVGGElement, d3.HierarchyPointNode<Milestone>, unknown>, d: d3.HierarchyPointNode<Milestone>) => {
    const subject = event.subject as any; // Type assertion for drag event subject
    subject.x += event.dx;
    subject.y += event.dy;
    setNodePositions(pos => ({
      ...pos,
      [d.data.id]: { x: subject.x, y: subject.y }
    }));
    d3.select(subject.element).attr(
      "transform",
      `translate(${subject.x},${subject.y})`
    );
  }, []);

  // Initialize zoom behavior
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    
    try {
      const svg = d3.select(svgRef.current);
      const g = d3.select(gRef.current);
      
      const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 3])
        .on("zoom", (event) => {
          if (event.transform) {
            g.attr("transform", event.transform.toString());
          }
        });
        
      svg.call(zoomBehavior);
      zoomRef.current = zoomBehavior;
      
      return () => { 
        svg.on(".zoom", null); 
        zoomRef.current = null;
      };
    } catch (err) {
      console.error("Error initializing zoom:", err);
    }
  }, []);

  // Memoize the hierarchy data creation which is an expensive computation
  const hierarchy = useMemo(() => {
    return createHierarchy(milestones, planTitle);
  }, [milestones, planTitle]);
  
  // The main render function for the tree visualization
  const renderTree = useCallback(() => {
    if (!svgRef.current || !gRef.current) return;
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    const width = containerRef.current?.clientWidth || 1000;
    const height = containerRef.current?.clientHeight || 600;

    // Create hierarchy data
    const hierarchyData = createHierarchy(milestones, planTitle);
    if (!hierarchyData) return;
    
    g.selectAll("*").remove();

    // Apply tree layout
    const treeLayout = d3.tree<Milestone>()
      .size([width * 0.95, height * 0.7])
      .separation((a, b) => (a.parent === b.parent ? 4.5 : 6.0));
    const root = treeLayout(hierarchy);

    // Configure drag behavior
    const drag = d3.drag<SVGGElement, d3.HierarchyPointNode<Milestone>>()
      .on("drag", (event, d) => handleNodeDrag(event, d));

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

    // Draw nodes with drag+drop support
    const nodes = root.descendants();
    const nodeGroup = g.selectAll<SVGGElement, d3.HierarchyPointNode<Milestone>>(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => {
        const pos = nodePositions[d.data.id];
        return `translate(${pos?.x ?? d.x},${pos?.y ?? d.y})`;
      })
      .call(d => {
        d.filter(dd => dd.data.id !== "virtual-root")
          .call(drag as any);
      })
      .style("cursor", d => d.data.id !== "virtual-root" ? "grab" : "default")
      .on("click", (event, d) => {
        if (d.data.id !== "virtual-root") onMilestoneClick(d.data.id);
      });

    // Render virtual root node (plan title)
    nodeGroup.filter(d => d.data.id === "virtual-root").append("rect")
      .attr("width", 200).attr("height", 70).attr("x", -100).attr("y", -35)
      .attr("rx", 10).attr("fill", "#f1f5f9").attr("stroke", "#cbd5e1").attr("stroke-width", 1);

    nodeGroup.filter(d => d.data.id === "virtual-root").append("text")
      .attr("x", 0).attr("y", 0).attr("text-anchor", "middle").attr("dominant-baseline", "central")
      .attr("font-size", "16px").attr("font-weight", "bold").attr("fill", "#334155")
      .text(d => d.data.title || "Project Plan");

    // Render milestone cards
    renderMilestoneCards(nodeGroup.filter(d => d.data.id !== "virtual-root"));

    // Center the visualization
    if (nodes.length > 0) {
      setTimeout(() => {
        const svgNode = svgRef.current, gNode = gRef.current;
        if (!svgNode || !gNode || !zoomRef.current) return;
        
        try {
          const svgRect = svgNode.getBoundingClientRect();
          const gBounds = gNode.getBBox();
          const scale = Math.min(
            0.9 * svgRect.width / gBounds.width,
            0.9 * svgRect.height / gBounds.height
          );
          const translateX = (svgRect.width/2) - (gBounds.x + gBounds.width/2) * scale;
          const translateY = (svgRect.height/2) - (gBounds.y + gBounds.height/2) * scale;
          
          d3.select(svgNode)
            .transition()
            .duration(750)
            .call(zoomRef.current.transform as any, d3.zoomIdentity.translate(translateX, translateY).scale(scale));
        } catch (err) {
          console.error("Error centering visualization:", err);
        }
      }, 100);
    }
  }, [milestones, selectedMilestone, onMilestoneClick, onEditMilestone, planTitle, nodePositions, handleNodeDrag]);

  // Helper function to render milestone cards
  const renderMilestoneCards = (selection: d3.Selection<SVGGElement, d3.HierarchyPointNode<Milestone>, null, unknown>) => {
    // Main cards
    selection.append("rect")
      .attr("width", CARD_WIDTH).attr("height", CARD_HEIGHT)
      .attr("x", -CARD_WIDTH/2).attr("y", -CARD_HEIGHT/2).attr("rx", 8)
      .attr("fill", d => d.data.id === selectedMilestone ? "#f9fafb" : "white")
      .attr("stroke", d => d.data.id === selectedMilestone ? "#3b82f6" : "#e2e8f0")
      .attr("stroke-width", d => d.data.id === selectedMilestone ? 2 : 1);

    // Status indicator (left-side colored bar)
    selection.append("rect")
      .attr("x", -CARD_WIDTH/2).attr("y", -CARD_HEIGHT/2)
      .attr("width", 6).attr("height", CARD_HEIGHT)
      .attr("rx", 3)
      .attr("fill", d => getStatusColor((d.data.status || "NOT_STARTED") as MilestoneStatus).bar);

    // Title text
    selection.append("text")
      .attr("x", -CARD_WIDTH/2+16).attr("y", -16)
      .attr("text-anchor", "start").attr("dominant-baseline", "central")
      .attr("font-size", "13px").attr("font-weight", "bold")
      .attr("fill", "#0f172a")
      .each(function(d) {
        const title = d.data.title || "Untitled";
        const maxLength = 18;
        d3.select(this).text(title.length > maxLength ? 
          title.substring(0, maxLength) + "..." : title);
      });

    // Status badge
    selection.append("rect")
      .attr("x", CARD_WIDTH/2-70).attr("y", -CARD_HEIGHT/2+10)
      .attr("width", 64).attr("height", 20).attr("rx", 10)
      .attr("fill", d => getStatusColor((d.data.status || "NOT_STARTED") as MilestoneStatus).badge);
      
    selection.append("text")
      .attr("x", CARD_WIDTH/2-38).attr("y", -CARD_HEIGHT/2+20)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("fill", d => getStatusColor((d.data.status || "NOT_STARTED") as MilestoneStatus).badgeText)
      .text(d => getStatusText((d.data.status || "NOT_STARTED") as MilestoneStatus));

    // Progress bar or deadline info
    selection.each(function(d) {
      const status = (d.data.status || "NOT_STARTED") as MilestoneStatus;
      const node = d3.select(this);
      
      if (status === "IN_PROGRESS") {
        renderProgressBar(node);
      } else {
        // Show due/delay text
        const timeLabel = d.data.deadline ? calculateTimeLeft(d.data.deadline) : "";
        node.append("text")
          .attr("x", -CARD_WIDTH/2+16).attr("y", 8)
          .attr("text-anchor", "start").attr("dominant-baseline", "central")
          .attr("font-size", "10px")
          .attr("fill", "#64748b")
          .text(timeLabel);
      }
    });

    // Add edit button to selected milestone
    if (onEditMilestone) {
      selection
        .filter(d => d.data.id === selectedMilestone)
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
  };

  // Helper function for progress bar
  const renderProgressBar = (selection: d3.Selection<SVGGElement, d3.HierarchyPointNode<Milestone>, null, unknown>) => {
    // Background bar
    selection.append("rect")
      .attr("x", -CARD_WIDTH/2+16).attr("y", 10)
      .attr("width", CARD_WIDTH-36).attr("height", 8).attr("rx", 4)
      .attr("fill", "#e0e7ef");
      
    // Progress value (50% for now)
    selection.append("rect")
      .attr("x", -CARD_WIDTH/2+16).attr("y", 10)
      .attr("width", (CARD_WIDTH-36)*0.5).attr("height", 8).attr("rx", 4)
      .attr("fill", getStatusColor("IN_PROGRESS" as MilestoneStatus).bar);
      
    // Percentage text
    selection.append("text")
      .attr("x", (CARD_WIDTH-36)/2+(-CARD_WIDTH/2+16)).attr("y", 14)
      .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
      .attr("font-size", "10px").attr("fill", "#334155")
      .text("50%");
  };

  // Update on dependencies change
  useEffect(() => { 
    renderTree(); 
  }, [renderTree, isFullScreen]);
  
  // Update on window resize
  useEffect(() => {
    const handleResize = () => renderTree();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderTree]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${isFullScreen ? "bg-white" : ""}`}
      style={isFullScreen ? { padding: "10px" } : undefined}
    >
      {/* SVG Container */}
      <svg ref={svgRef} className={`w-full h-full ${isFullScreen ? "rounded-md shadow-sm" : ""}`}>
        <g ref={gRef}></g>
      </svg>
      
      {/* Controls */}
      <div className="absolute flex flex-col items-center space-y-3 top-6 right-7 z-10">
        <button
          onClick={toggleFullScreen}
          title={isFullScreen ? "Exit Full Screen (ESC)" : "Enter Full Screen"}
          className={`bg-white rounded-lg shadow hover:scale-105 transition p-2 flex items-center border ${isFullScreen ? "border-blue-400" : "border-slate-200"}`}
        >
          <Fullscreen
            className="w-5 h-5"
            color={isFullScreen ? "#3b82f6" : "#334155"}
            strokeWidth={2}
            aria-label={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          />
        </button>
      </div>
      
      {/* Status Legend */}
      <StatusLegend isFullScreen={isFullScreen} />
    </div>
  );
};

export default D3TreeVisualization;
