import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Milestone } from '../../types/plan';
import { formatDate } from '../../utils/dateUtils';
import { statusConfig } from '../../utils/milestoneUtils';

interface TimelineViewProps {
  milestones: Milestone[];
  onMilestoneClick: (id: string) => void;
  selectedMilestone: string | null;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  milestones,
  onMilestoneClick,
  selectedMilestone
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || milestones.length === 0) return;

    const svg = d3.select(svgRef.current);
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    svg.selectAll('*').remove();

    // Filter milestones with deadlines
    const timedMilestones = milestones.filter(m => m.deadline);
    if (timedMilestones.length === 0) return;

    // Calculate optimal dimensions - NO MORE SCROLLING
    const margin = { top: 80, right: 80, bottom: 80, left: 280 };
    const rowHeight = Math.max(60, Math.min(100, (containerHeight - margin.top - margin.bottom) / timedMilestones.length));
    const width = containerWidth;
    const height = Math.max(containerHeight, timedMilestones.length * rowHeight + margin.top + margin.bottom);

    // Set up scales - Use UTC to avoid timezone offset issues
    const dates = timedMilestones.map(m => {
      const date = new Date(m.deadline!);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    });
    const minDate = d3.min(dates)!;
    const maxDate = d3.max(dates)!;
    
    // Add padding to date range
    const timePadding = (maxDate.getTime() - minDate.getTime()) * 0.1;
    const paddedMinDate = new Date(minDate.getTime() - timePadding);
    const paddedMaxDate = new Date(maxDate.getTime() + timePadding);
    
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleTime()
      .domain([paddedMinDate, paddedMaxDate])
      .range([0, chartWidth])
      .nice();

    const yScale = d3.scaleBand()
      .domain(timedMilestones.map((_, i) => i.toString()))
      .range([0, chartHeight])
      .padding(0.4);

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add subtle grid lines
    const gridLines = g.append('g')
      .attr('class', 'grid-lines')
      .attr('opacity', 0.08);

    xScale.ticks(10).forEach(tick => {
      gridLines.append('line')
        .attr('x1', xScale(tick))
        .attr('x2', xScale(tick))
        .attr('y1', 0)
        .attr('y2', chartHeight)
        .attr('stroke', '#94a3b8')
        .attr('stroke-dasharray', '3,3');
    });

    // Enhanced timeline axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(10)
      .tickFormat(d => d3.timeFormat('%b %d, %Y')(d as Date));

    const xAxisGroup = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis);
    
    xAxisGroup.selectAll('text')
      .style('font-size', '14px')
      .style('fill', '#475569')
      .style('font-weight', '500');
    
    xAxisGroup.selectAll('line, path')
      .style('stroke', '#cbd5e1');

    // Add "Today" marker
    const today = new Date();
    if (today >= paddedMinDate && today <= paddedMaxDate) {
      g.append('line')
        .attr('x1', xScale(today))
        .attr('x2', xScale(today))
        .attr('y1', -30)
        .attr('y2', chartHeight)
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '8,5')
        .attr('opacity', 0.7);

      const todayLabel = g.append('g')
        .attr('transform', `translate(${xScale(today)}, -35)`);
      
      todayLabel.append('rect')
        .attr('x', -30)
        .attr('y', -12)
        .attr('width', 60)
        .attr('height', 24)
        .attr('rx', 12)
        .attr('fill', '#3b82f6');
      
      todayLabel.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'white')
        .attr('font-weight', '700')
        .text('TODAY');
    }

    // Add milestone rows
    const milestoneGroups = g.selectAll('.milestone-group')
      .data(timedMilestones)
      .enter()
      .append('g')
      .attr('class', 'milestone-group')
      .attr('transform', (d, i) => `translate(0,${yScale(i.toString())})`);

    // Row backgrounds
    milestoneGroups.append('rect')
      .attr('x', -margin.left)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', yScale.bandwidth())
      .attr('fill', (d, i) => i % 2 === 0 ? '#f8fafc' : 'transparent')
      .attr('opacity', 0.5);

    // Milestone labels
    milestoneGroups.append('text')
      .attr('x', -20)
      .attr('y', yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '15px')
      .attr('font-weight', d => d.id === selectedMilestone ? '700' : '600')
      .attr('fill', d => d.id === selectedMilestone ? '#1e293b' : '#475569')
      .text(d => d.title.length > 35 ? d.title.substring(0, 35) + '...' : d.title)
      .style('cursor', 'pointer')
      .on('click', function(event, d) {
        event.stopPropagation();
        onMilestoneClick(d.id);
      })
      .on('mouseenter', function() {
        d3.select(this).attr('fill', '#3b82f6');
      })
      .on('mouseleave', function(event, d) {
        d3.select(this).attr('fill', d.id === selectedMilestone ? '#1e293b' : '#475569');
      });

    // Connecting lines
    milestoneGroups.append('line')
      .attr('x1', -10)
      .attr('x2', d => {
        const date = new Date(d.deadline!);
        const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return xScale(localDate);
      })
      .attr('y1', yScale.bandwidth() / 2)
      .attr('y2', yScale.bandwidth() / 2)
      .attr('stroke', d => statusConfig[d.status || 'NOT_STARTED'].ribbonColor)
      .attr('stroke-width', 2)
      .attr('opacity', 0.3)
      .attr('stroke-dasharray', '5,5');

    // Enhanced milestone dots with glow
    const dotGroup = milestoneGroups.append('g')
      .attr('transform', d => {
        const date = new Date(d.deadline!);
        const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return `translate(${xScale(localDate)}, ${yScale.bandwidth() / 2})`;
      })
      .style('cursor', 'pointer')
      .on('click', function(event, d) {
        event.stopPropagation();
        onMilestoneClick(d.id);
      });

    // Glow for selected
    dotGroup.filter(d => d.id === selectedMilestone)
      .append('circle')
      .attr('r', 18)
      .attr('fill', d => statusConfig[d.status || 'NOT_STARTED'].ribbonColor)
      .attr('opacity', 0.2);

    // Main dot
    dotGroup.append('circle')
      .attr('r', d => d.id === selectedMilestone ? 11 : 9)
      .attr('fill', d => statusConfig[d.status || 'NOT_STARTED'].ribbonColor)
      .attr('stroke', 'white')
      .attr('stroke-width', 3)
      .style('filter', 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))');

    // Date labels
    const dateLabel = milestoneGroups.append('g')
      .attr('transform', d => {
        const date = new Date(d.deadline!);
        const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return `translate(${xScale(localDate)}, ${yScale.bandwidth() + 15})`;
      });
    
    dateLabel.append('rect')
      .attr('x', -40)
      .attr('y', -10)
      .attr('width', 80)
      .attr('height', 20)
      .attr('rx', 5)
      .attr('fill', '#f1f5f9')
      .attr('opacity', 0.9);
    
    dateLabel.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#64748b')
      .attr('font-weight', '600')
      .text(d => {
        const date = new Date(d.deadline!);
        const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return d3.timeFormat('%b %d')(localDate);
      });

  }, [milestones, selectedMilestone, onMilestoneClick, isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div 
      ref={containerRef} 
      className={`${isFullscreen ? 'fixed inset-0 z-50 p-6' : 'relative'} bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300`}
      style={{ height: isFullscreen ? '100vh' : '100%' }}
    >
      {/* Fullscreen Toggle */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-10 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors"
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        )}
      </button>

      {milestones.filter(m => m.deadline).length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-500 p-8">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Deadlines Set</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
            Add deadlines to your milestones to visualize them on the timeline and track progress over time.
          </p>
        </div>
      ) : (
        <div className="w-full h-full overflow-auto p-6">
          <svg ref={svgRef} className="w-full"></svg>
        </div>
      )}
    </div>
  );
};
