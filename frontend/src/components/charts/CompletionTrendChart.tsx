import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TrendData } from '../../services/analyticsService';

interface CompletionTrendChartProps {
  data: TrendData[];
  height?: number;
}

export const CompletionTrendChart = ({ data, height = 300 }: CompletionTrendChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !containerRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = containerRef.current.clientWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse dates
    const parseDate = d3.timeParse('%Y-%m-%d');
    const processedData = data.map(d => ({
      date: parseDate(d.date)!,
      completed: d.completed,
      total: d.total
    }));

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(processedData, d => d.date) as [Date, Date])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, d => Math.max(d.completed, d.total)) || 10])
      .nice()
      .range([chartHeight, 0]);

    // Line generators
    const completedLine = d3
      .line<typeof processedData[0]>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.completed))
      .curve(d3.curveMonotoneX);

    // Area generator for gradient fill
    const completedArea = d3
      .area<typeof processedData[0]>()
      .x(d => xScale(d.date))
      .y0(chartHeight)
      .y1(d => yScale(d.completed))
      .curve(d3.curveMonotoneX);

    // Add gradient
    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'completionGradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.3);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.05);

    // Add area
    svg
      .append('path')
      .datum(processedData)
      .attr('class', 'area')
      .attr('d', completedArea)
      .attr('fill', 'url(#completionGradient)');

    // Add line
    svg
      .append('path')
      .datum(processedData)
      .attr('class', 'line')
      .attr('d', completedLine)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2.5);

    // Add axes
    const xAxis = d3.axisBottom(xScale).ticks(6);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('class', 'text-xs fill-gray-600 dark:fill-gray-400');

    svg
      .append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .attr('class', 'text-xs fill-gray-600 dark:fill-gray-400');

    // Style axes
    svg.selectAll('.domain, .tick line')
      .attr('stroke', 'currentColor')
      .attr('class', 'stroke-gray-300 dark:stroke-gray-600');

    // Add dots for data points
    svg
      .selectAll('.dot')
      .data(processedData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.completed))
      .attr('r', 4)
      .attr('fill', '#3b82f6')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('r', 6);
        
        // Show tooltip
        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'chart-tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px 12px')
          .style('border-radius', '6px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .html(`
            <div>
              <strong>${d3.timeFormat('%b %d, %Y')(d.date)}</strong><br/>
              Completed: ${d.completed}<br/>
              Total: ${d.total}
            </div>
          `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mouseout', function () {
        d3.select(this).attr('r', 4);
        d3.selectAll('.chart-tooltip').remove();
      });

  }, [data, height]);

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef}></svg>
    </div>
  );
};
