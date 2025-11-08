import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { StatusDistribution } from '../../services/analyticsService';
import { statusConfig } from '../../utils/milestoneUtils';

interface StatusPieChartProps {
  data: StatusDistribution;
  size?: number;
}

export const StatusPieChart = ({ data, size = 280 }: StatusPieChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const width = size;
    const height = size;
    const radius = Math.min(width, height) / 2 - 10;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Prepare data
    const pieData = Object.entries(data)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({
        status: key,
        count: value
      }));

    if (pieData.length === 0) {
      // Show empty state
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('class', 'text-sm fill-gray-500')
        .text('No data available');
      return;
    }

    // Color map based on status
    const colorMap: Record<string, string> = {
      NOT_STARTED: statusConfig.NOT_STARTED.ribbonColor,
      IN_PROGRESS: statusConfig.IN_PROGRESS.ribbonColor,
      COMPLETED: statusConfig.COMPLETED.ribbonColor,
      AT_RISK: statusConfig.AT_RISK.ribbonColor,
      DELAYED: statusConfig.DELAYED.ribbonColor
    };

    // Pie generator
    const pie = d3
      .pie<typeof pieData[0]>()
      .value(d => d.count)
      .sort(null);

    // Arc generator
    const arc = d3
      .arc<d3.PieArcDatum<typeof pieData[0]>>()
      .innerRadius(radius * 0.6) // Donut chart
      .outerRadius(radius);

    // Arc for hover effect
    const arcHover = d3
      .arc<d3.PieArcDatum<typeof pieData[0]>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius + 10);

    // Draw slices
    const slices = svg
      .selectAll('.slice')
      .data(pie(pieData))
      .enter()
      .append('g')
      .attr('class', 'slice');

    slices
      .append('path')
      .attr('d', arc)
      .attr('fill', d => colorMap[d.data.status] || '#94a3b8')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arcHover(d) as string);

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
              <strong>${statusConfig[d.data.status as keyof typeof statusConfig].label}</strong><br/>
              Count: ${d.data.count}<br/>
              ${((d.data.count / d3.sum(pieData, dd => dd.count)!) * 100).toFixed(1)}%
            </div>
          `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mouseout', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc(d) as string);
        d3.selectAll('.chart-tooltip').remove();
      });

    // Add center text with total count
    const total = d3.sum(pieData, d => d.count) || 0;
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('class', 'text-2xl font-bold fill-gray-900 dark:fill-white')
      .text(total);

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .attr('class', 'text-xs fill-gray-500')
      .text('Total Milestones');

  }, [data, size]);

  return (
    <div className="flex justify-center items-center">
      <svg ref={svgRef}></svg>
    </div>
  );
};
