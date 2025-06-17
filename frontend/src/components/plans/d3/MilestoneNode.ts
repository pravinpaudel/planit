import React from "react";
import * as d3 from "d3";
import { getStatusColor, getStatusText, MilestoneStatus } from "../planStatusUtils";
import { calculateTimeLeft } from "./D3TreeHelpers";
import { Milestone } from "../../../types/plan";

export const CARD_WIDTH = 160;
export const CARD_HEIGHT = 70;

interface MilestoneNodeProps {
  d: d3.HierarchyPointNode<Milestone>;
  selectedMilestone: string | null;
  onMilestoneClick: (id: string) => void;
  onEditMilestone?: (id: string) => void;
}

/**
 * Renders a milestone node based on D3 hierarchy point node data
 * This is used by D3TreeVisualization's renderTree function
 */
export function renderMilestoneNode(props: MilestoneNodeProps): SVGGElement {
  const { d, selectedMilestone, onMilestoneClick, onEditMilestone } = props;
  
  // Create the group element for the milestone
  const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  nodeGroup.classList.add("node");
  nodeGroup.style.cursor = "pointer";
  nodeGroup.addEventListener("click", () => {
    if (d.data.id !== "virtual-root") onMilestoneClick(d.data.id);
  });
  
  if (d.data.id === "virtual-root") {
    renderVirtualRoot(nodeGroup, d);
  } else {
    renderMilestoneCard(nodeGroup, d, selectedMilestone);
    
    // Add edit button if selected and edit function provided
    if (onEditMilestone && d.data.id === selectedMilestone) {
      addEditButton(nodeGroup, d, onEditMilestone);
    }
  }
  
  return nodeGroup;
}

// Helper function to render the virtual root (project plan node)
function renderVirtualRoot(
  nodeGroup: SVGGElement,
  d: d3.HierarchyPointNode<Milestone>
): void {
  // Root node rectangle
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("width", "200");
  rect.setAttribute("height", "70");
  rect.setAttribute("x", "-100");
  rect.setAttribute("y", "-35");
  rect.setAttribute("rx", "10");
  rect.setAttribute("fill", "#f1f5f9");
  rect.setAttribute("stroke", "#cbd5e1");
  rect.setAttribute("stroke-width", "1");
  nodeGroup.appendChild(rect);
  
  // Root node title
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", "0");
  text.setAttribute("y", "0");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "central");
  text.setAttribute("font-size", "16px");
  text.setAttribute("font-weight", "bold");
  text.setAttribute("fill", "#334155");
  text.textContent = d.data.title || "Project Plan";
  nodeGroup.appendChild(text);
}

// Helper function to render a milestone card
function renderMilestoneCard(
  nodeGroup: SVGGElement,
  d: d3.HierarchyPointNode<Milestone>,
  selectedMilestone: string | null
): void {
  const status = (d.data.status || "NOT_STARTED") as MilestoneStatus;
  
  // Main card rectangle
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("width", CARD_WIDTH.toString());
  rect.setAttribute("height", CARD_HEIGHT.toString());
  rect.setAttribute("x", (-CARD_WIDTH/2).toString());
  rect.setAttribute("y", (-CARD_HEIGHT/2).toString());
  rect.setAttribute("rx", "8");
  rect.setAttribute("fill", d.data.id === selectedMilestone ? "#f9fafb" : "white");
  rect.setAttribute("stroke", d.data.id === selectedMilestone ? "#3b82f6" : "#e2e8f0");
  rect.setAttribute("stroke-width", d.data.id === selectedMilestone ? "2" : "1");
  nodeGroup.appendChild(rect);
  
  // Color-coded left-side bar
  const statusBar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  statusBar.setAttribute("x", (-CARD_WIDTH/2).toString());
  statusBar.setAttribute("y", (-CARD_HEIGHT/2).toString());
  statusBar.setAttribute("width", "6");
  statusBar.setAttribute("height", CARD_HEIGHT.toString());
  statusBar.setAttribute("rx", "3");
  statusBar.setAttribute("fill", getStatusColor(status).bar);
  nodeGroup.appendChild(statusBar);
  
  // Title
  const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
  title.setAttribute("x", (-CARD_WIDTH/2+16).toString());
  title.setAttribute("y", "-16");
  title.setAttribute("text-anchor", "start");
  title.setAttribute("dominant-baseline", "central");
  title.setAttribute("font-size", "13px");
  title.setAttribute("font-weight", "bold");
  title.setAttribute("fill", "#0f172a");
  
  const titleText = d.data.title || "Untitled";
  const maxLength = 18;
  title.textContent = titleText.length > maxLength 
    ? titleText.substring(0, maxLength) + "..." 
    : titleText;
  nodeGroup.appendChild(title);
  
  // Badge (top right)
  const badge = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  badge.setAttribute("x", (CARD_WIDTH/2-70).toString());
  badge.setAttribute("y", (-CARD_HEIGHT/2+10).toString());
  badge.setAttribute("width", "64");
  badge.setAttribute("height", "20");
  badge.setAttribute("rx", "10");
  badge.setAttribute("fill", getStatusColor(status).badge);
  nodeGroup.appendChild(badge);
  
  const badgeText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  badgeText.setAttribute("x", (CARD_WIDTH/2-38).toString());
  badgeText.setAttribute("y", (-CARD_HEIGHT/2+20).toString());
  badgeText.setAttribute("text-anchor", "middle");
  badgeText.setAttribute("dominant-baseline", "central");
  badgeText.setAttribute("font-size", "10px");
  badgeText.setAttribute("font-weight", "600");
  badgeText.setAttribute("fill", getStatusColor(status).badgeText);
  badgeText.textContent = getStatusText(status);
  nodeGroup.appendChild(badgeText);
  
  // Progress bar or due/delayed time
  if (status === "IN_PROGRESS") {
    renderProgressBar(nodeGroup);
  } else {
    // Show due/delay text below title
    const timeLabel = d.data.deadline ? calculateTimeLeft(d.data.deadline) : "";
    const timeText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    timeText.setAttribute("x", (-CARD_WIDTH/2+16).toString());
    timeText.setAttribute("y", "8");
    timeText.setAttribute("text-anchor", "start");
    timeText.setAttribute("dominant-baseline", "central");
    timeText.setAttribute("font-size", "10px");
    timeText.setAttribute("fill", "#64748b");
    timeText.textContent = timeLabel;
    nodeGroup.appendChild(timeText);
  }
}

// Helper function to render a progress bar for IN_PROGRESS status
function renderProgressBar(nodeGroup: SVGGElement): void {
  // Progress bar bg
  const progressBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  progressBg.setAttribute("x", (-CARD_WIDTH/2+16).toString());
  progressBg.setAttribute("y", "10");
  progressBg.setAttribute("width", (CARD_WIDTH-36).toString());
  progressBg.setAttribute("height", "8");
  progressBg.setAttribute("rx", "4");
  progressBg.setAttribute("fill", "#e0e7ef");
  nodeGroup.appendChild(progressBg);
  
  // Progress bar value (fake 50% for now)
  const progressValue = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  progressValue.setAttribute("x", (-CARD_WIDTH/2+16).toString());
  progressValue.setAttribute("y", "10");
  progressValue.setAttribute("width", ((CARD_WIDTH-36)*0.5).toString());
  progressValue.setAttribute("height", "8");
  progressValue.setAttribute("rx", "4");
  progressValue.setAttribute("fill", getStatusColor("IN_PROGRESS").bar);
  nodeGroup.appendChild(progressValue);
  
  const progressText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  progressText.setAttribute("x", ((CARD_WIDTH-36)/2+(-CARD_WIDTH/2+16)).toString());
  progressText.setAttribute("y", "14");
  progressText.setAttribute("text-anchor", "middle");
  progressText.setAttribute("dominant-baseline", "middle");
  progressText.setAttribute("font-size", "10px");
  progressText.setAttribute("fill", "#334155");
  progressText.textContent = "50%";
  nodeGroup.appendChild(progressText);
}

// Helper function to add edit button if milestone is selected
function addEditButton(
  nodeGroup: SVGGElement, 
  d: d3.HierarchyPointNode<Milestone>, 
  onEditMilestone: (id: string) => void
): void {
  const editText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  editText.setAttribute("x", (CARD_WIDTH/2-24).toString());
  editText.setAttribute("y", (CARD_HEIGHT/2-14).toString());
  editText.setAttribute("text-anchor", "middle");
  editText.setAttribute("dominant-baseline", "central");
  editText.setAttribute("font-size", "16px");
  editText.setAttribute("fill", "#3b82f6");
  editText.style.cursor = "pointer";
  editText.textContent = "✎";
  
  editText.addEventListener("click", (event) => {
    event.stopPropagation();
    onEditMilestone(d.data.id);
  });
  
  nodeGroup.appendChild(editText);
}
