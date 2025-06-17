import React, { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import { Fullscreen } from "lucide-react";
import { getStatusColor, getStatusText, MilestoneStatus } from "./planStatusUtils";
import { Milestone } from "../../types/plan";
// Temporarily reverting D3TreeUtils import while we fix integration issues

interface D3TreeVisualizationProps {
  milestones: Record<string, Milestone>;
  onMilestoneClick: (id: string) => void;
  selectedMilestone: string | null;
  onEditMilestone?: (id: string) => void;
  planTitle?: string;
}
const CARD_WIDTH = 160;
const CARD_HEIGHT = 70;

const D3TreeVisualization: React.FC<D3TreeVisualizationProps> = ({
  milestones,
  onMilestoneClick,
  selectedMilestone,
  onEditMilestone,
  planTitle = "Project Plan"
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // DISPLAY controls state
  // Don't store the zoom behavior in state to avoid the 'property' of null error
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Fullscreen handling
  const toggleFullScreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!isFullScreen) {
      if (containerRef.current.requestFullscreen) containerRef.current.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }, [isFullScreen]);
  useEffect(() => {
    const handleChange = () =>
      setIsFullScreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
    };
  }, []);

  // --- HIERARCHY (abbreviated for clarity)
  const findRootNodes = useCallback(()=>
    Object.keys(milestones).filter(id =>
      !milestones[id].parentId || milestones[id].parentId === null
    ), [milestones]);
  const buildHierarchicalData = (
    milestoneId: string,
    milestonesData: Record<string, Milestone>,
    visited: Set<string> = new Set()
  ): Milestone => {
    if (visited.has(milestoneId)) {
      return { id: milestoneId, title: "Circular Reference", description: "", taskId: "",
        status: "NOT_STARTED", deadline: "", createdAt: "", updatedAt: "", children: [] };
    }
    const milestone = milestonesData[milestoneId];
    if (!milestone) {
      return { id: milestoneId, title: "Missing Milestone", description: "", taskId: "",
        status: "NOT_STARTED", deadline: "", createdAt: "", updatedAt: "", children: [] };
    }
    visited.add(milestoneId);
    const childMilestones = Object.values(milestonesData).filter(m => m.parentId === milestoneId);
    return {
      ...milestone,
      children: childMilestones.map(child => buildHierarchicalData(child.id, milestonesData, new Set(visited)))
    };
  };
  const createHierarchy = useCallback(() => {
    const rootNodes = findRootNodes();
    if (rootNodes.length === 0) return null;
    const virtualRoot: Milestone = {
      id: "virtual-root", title: planTitle, description: "", taskId: "",
      status: "NOT_STARTED", deadline: "", createdAt: "", updatedAt: "",
      children: rootNodes.map(id => buildHierarchicalData(id, milestones))
    };
    return d3.hierarchy(virtualRoot);
  }, [milestones, findRootNodes, planTitle]);

  // Helper function for deadline/delay
  const calculateTimeLeft = (deadline: string) => {
    if (!deadline) return "";
    const deadlineDate = new Date(deadline), now = new Date();
    if (isNaN(deadlineDate.getTime())) return "";
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "1 day left";
    return `${diffDays} days left`;
  };

  // --- Drag handler for d3 (visual only!)
  const [nodePositions, setNodePositions] = useState<Record<string, {x:number, y:number}>>({});
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

  // --- RENDER TREE ---  
  const renderTree = useCallback(() => {
    if (!svgRef.current || !gRef.current) return;
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    const width = containerRef.current?.clientWidth || 1000;
    const height = containerRef.current?.clientHeight || 600;

    g.selectAll("*").remove();

    const hierarchy = createHierarchy();
    if (!hierarchy) return;

    // Layout
    const treeLayout = d3.tree<Milestone>()
      .size([width * 0.95, height * 0.7])
      .separation((a, b) => (a.parent === b.parent ? 4.5 : 6.0));
    const root = treeLayout(hierarchy);

    // Prepare drag
    const drag = d3.drag<SVGGElement, d3.HierarchyPointNode<Milestone>>()
      .on("drag", function (event, d) {
        handleNodeDrag(event, d);
      });

    // --- Draw links
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

    // --- Draw nodes with drag+drop support
    const nodes = root.descendants();
    const nodeGroup = g.selectAll<SVGGElement, d3.HierarchyPointNode<Milestone>>(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => {
        // Use custom position if dragged, else d.x/d.y
        const pos = nodePositions[d.data.id];
        return `translate(${pos?.x ?? d.x},${pos?.y ?? d.y})`;
      })
      .call(d => {
        // Only non-root nodes are draggable
        d.filter(dd=>dd.data.id!=="virtual-root")
          .call(drag as any);
      })
      .style("cursor", d => d.data.id !== "virtual-root" ? "grab" : "default")
      .on("click", (event, d) => {
        if (d.data.id !== "virtual-root") onMilestoneClick(d.data.id);
      });

    // --- Virtual root node (plan)
    nodeGroup.filter(d=>d.data.id==="virtual-root").append("rect")
      .attr("width", 200).attr("height", 70).attr("x", -100).attr("y", -35)
      .attr("rx", 10).attr("fill", "#f1f5f9").attr("stroke", "#cbd5e1").attr("stroke-width", 1);

    nodeGroup.filter(d=>d.data.id==="virtual-root").append("text")
      .attr("x", 0).attr("y", 0).attr("text-anchor", "middle").attr("dominant-baseline", "central")
      .attr("font-size", "16px").attr("font-weight", "bold").attr("fill", "#334155")
      .text(d=>d.data.title || "Project Plan");

    // --- Milestone cards [with bar, badge, progress, time]
    const milestoneNodes = nodeGroup.filter(d=>d.data.id!=="virtual-root");
    milestoneNodes.append("rect")
      .attr("width", CARD_WIDTH).attr("height", CARD_HEIGHT)
      .attr("x", -CARD_WIDTH/2).attr("y", -CARD_HEIGHT/2).attr("rx", 8)
      .attr("fill", d=>d.data.id===selectedMilestone?"#f9fafb":"white")
      .attr("stroke", d=>d.data.id===selectedMilestone?"#3b82f6":"#e2e8f0").attr("stroke-width", d=>d.data.id===selectedMilestone?2:1);

    // Color-coded left-side bar
    milestoneNodes.append("rect")
      .attr("x", -CARD_WIDTH/2).attr("y", -CARD_HEIGHT/2)
      .attr("width", 6).attr("height", CARD_HEIGHT)
      .attr("rx", 3)
      .attr("fill", d => getStatusColor((d.data.status || "NOT_STARTED") as MilestoneStatus).bar);

    // Title
    milestoneNodes.append("text")
      .attr("x", -CARD_WIDTH/2+16).attr("y", -16)
      .attr("text-anchor", "start").attr("dominant-baseline", "central")
      .attr("font-size", "13px").attr("font-weight", "bold")
      .attr("fill", "#0f172a")
      .each(function(d) {
        const title = d.data.title || "Untitled";
        const maxLength = 18, text = title.length > maxLength ? title.substring(0, maxLength) + "..." : title;
        d3.select(this).text(text);
      });

    // Badge (top right)
    milestoneNodes.append("rect")
      .attr("x", CARD_WIDTH/2-70).attr("y", -CARD_HEIGHT/2+10)
      .attr("width", 64).attr("height", 20).attr("rx", 10)
      .attr("fill", d => getStatusColor((d.data.status || "NOT_STARTED") as MilestoneStatus).badge );
    milestoneNodes.append("text")
      .attr("x", CARD_WIDTH/2-38).attr("y", -CARD_HEIGHT/2+20)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("fill", d => getStatusColor((d.data.status || "NOT_STARTED") as MilestoneStatus).badgeText )
      .text(d => getStatusText((d.data.status || "NOT_STARTED") as MilestoneStatus));

    // Progress bar or due/delayed time
    milestoneNodes.each(function(d) {
      const status = (d.data.status || "NOT_STARTED") as MilestoneStatus;
      const node = d3.select(this);
      if (status === "IN_PROGRESS") {
        // Progress bar bg
        node.append("rect")
          .attr("x", -CARD_WIDTH/2+16).attr("y", 10)
          .attr("width", CARD_WIDTH-36).attr("height", 8).attr("rx", 4)
          .attr("fill", "#e0e7ef");
        // Progress bar value (fake 50% for now)
        node.append("rect")
          .attr("x", -CARD_WIDTH/2+16).attr("y", 10)
          .attr("width", (CARD_WIDTH-36)*0.5).attr("height", 8).attr("rx", 4)
          .attr("fill", getStatusColor(status).bar);
        node.append("text")
          .attr("x", (CARD_WIDTH-36)/2+(-CARD_WIDTH/2+16)).attr("y", 14)
          .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
          .attr("font-size", "10px").attr("fill", "#334155")
          .text("50%");
      } else {
        // Show due/delay text below title
        const timeLabel = d.data.deadline ? calculateTimeLeft(d.data.deadline) : "";
        node.append("text")
          .attr("x", -CARD_WIDTH/2+16).attr("y", 8)
          .attr("text-anchor", "start").attr("dominant-baseline", "central")
          .attr("font-size", "10px")
          .attr("fill", "#64748b")
          .text(timeLabel);
      }
    });

    // Edit icon if selected
    if (onEditMilestone) {
      milestoneNodes
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

    // Center the visualization
    if (nodes.length > 0) {
      setTimeout(() => {
        const svgNode = svgRef.current, gNode = gRef.current;
        if (!svgNode || !gNode) return;
        const svgRect = svgNode.getBoundingClientRect();
        const gBounds = gNode.getBBox();
        const scale = Math.min(
          0.9 * svgRect.width / gBounds.width,
          0.9 * svgRect.height / gBounds.height
        );
        const translateX = (svgRect.width/2)-(gBounds.x+gBounds.width/2)*scale;
        const translateY = (svgRect.height/2)-(gBounds.y+gBounds.height/2)*scale;
        if (zoomRef.current) {
          try {
            const zoomIdentity = d3.zoomIdentity.translate(translateX, translateY).scale(scale);
            d3.select(svgNode)
              .transition()
              .duration(750)
              .call(zoomRef.current.transform as any, zoomIdentity);
          } catch (err) {
            console.error("Error applying zoom transform:", err);
          }
        }
      }, 100);
    }
  }, [milestones, selectedMilestone, createHierarchy, onMilestoneClick, onEditMilestone, nodePositions, handleNodeDrag]);

  // d3.zoom
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    
    // Initialize zoom behavior
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    
    try {
      const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 3])
        .on("zoom", (event) => {
          if (event.transform) {
            g.attr("transform", event.transform.toString());
          }
        });
        
      // Safely attach zoom behavior
      svg.call(zoomBehavior);
      
      // Store zoom behavior in ref instead of state
      zoomRef.current = zoomBehavior;
      
      // Cleanup function
      return () => { 
        svg.on(".zoom", null); 
        zoomRef.current = null;
      };
    } catch (err) {
      console.error("Error initializing zoom:", err);
    }
  }, []);

  useEffect(() => { renderTree(); }, [renderTree, isFullScreen]);
  useEffect(() => {
    const handleResize = () => renderTree();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderTree]);

  // --- Overlayed modern controls
  const controls = (
    <div className="absolute flex flex-col items-center space-y-3 top-6 right-7 z-10">
      <button onClick={toggleFullScreen} title={isFullScreen ? "Exit Full Screen (ESC)" : "Enter Full Screen"}
        className={`bg-white rounded-lg shadow hover:scale-105 transition p-2 flex items-center border ${isFullScreen ? "border-blue-400" : "border-slate-200"}`}>
        <Fullscreen
          className="w-5 h-5"
          color={isFullScreen ? "#3b82f6" : "#334155"}
          strokeWidth={2}
          aria-label={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        />
      </button>
    </div>
  );

  // --- Instructions/Legend
  const instructions = (
    <div className={`absolute bottom-4 left-4 bg-white p-3 rounded-md shadow-md text-xs text-gray-600 ${isFullScreen ? 'opacity-90 hover:opacity-100 transition-opacity' : ''}`}>
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

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${isFullScreen ? "bg-white" : ""}`}
      style={isFullScreen ? { padding: "10px" } : undefined}
    >
      <svg ref={svgRef} className={`w-full h-full ${isFullScreen ? "rounded-md shadow-sm" : ""}`}>
        <g ref={gRef}></g>
      </svg>
      {controls}
      {instructions}
    </div>
  );
};

export default D3TreeVisualization;