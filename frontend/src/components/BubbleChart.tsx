import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { BubbleBubble } from '../types';
import styles from './BubbleChart.module.css';

interface Props {
  bubbles: BubbleBubble[];
  title: string;
}

type BubbleNode = BubbleBubble &
  d3.SimulationNodeDatum & {
    r: number;
    x: number;
    y: number;
  };

export default function BubbleChart({ bubbles, title }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    if (!svgRef.current || bubbles.length === 0) return;

    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 600;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    const viewport = svg.append('g');

    // Stable hit-area so pan/zoom also works in empty chart regions.
    viewport
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .style('pointer-events', 'all');

    // Normalize radii to fit the SVG
    const maxRadius = Math.max(...bubbles.map((b) => b.radius));
    const scaleFactor = Math.min(width, height) / (maxRadius * 4.5);
    const nodes: BubbleNode[] = bubbles.map((b) => ({
      ...b,
      r: Math.max(b.radius * scaleFactor, 20),
      x: width / 2 + (Math.random() - 0.5) * 100,
      y: height / 2 + (Math.random() - 0.5) * 100,
    }));

    const simulation = d3
      .forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(5))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<BubbleNode>().radius((d) => d.r + 4))
      .stop();

    for (let i = 0; i < 300; i++) simulation.tick();

    const defs = svg.append('defs');
    const g = viewport.append('g');

    // Bubbles
    const bubbleG = g
      .selectAll('g.bubble')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'bubble')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    // Outer glow circle
    bubbleG
      .append('circle')
      .attr('r', (d) => d.r + 8)
      .attr('fill', (d) => d.color)
      .attr('opacity', 0.15);

    // Main circle
    bubbleG
      .append('circle')
      .attr('r', (d) => d.r)
      .attr('fill', (d) => {
        const grad = defs.append('radialGradient').attr('id', `grad-${d.id}`);
        grad.append('stop').attr('offset', '0%').attr('stop-color', lightenColor(d.color, 40));
        grad.append('stop').attr('offset', '100%').attr('stop-color', d.color);
        return `url(#grad-${d.id})`;
      })
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 2)
      .attr('opacity', 0.92);

    // Label
    bubbleG
      .append('text')
      .text((d) => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .attr('fill', '#fff')
      .attr('font-size', (d) => Math.max(d.r / 3.5, 10))
      .attr('font-weight', '700')
      .attr('font-family', 'Inter, sans-serif');

    // Value
    bubbleG
      .append('text')
      .text((d) => d.value.toLocaleString())
      .attr('text-anchor', 'middle')
      .attr('dy', '1.1em')
      .attr('fill', 'rgba(255,255,255,0.8)')
      .attr('font-size', (d) => Math.max(d.r / 5, 8))
      .attr('font-family', 'Inter, sans-serif');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 4])
      .translateExtent([
        [-width * 2, -height * 2],
        [width * 3, height * 3],
      ])
      .filter((event) => {
        // Allow wheel zoom, primary-button drag and touch gestures.
        if (event.type === 'wheel') return true;
        if (event.type.startsWith('touch')) return true;
        return !(event instanceof MouseEvent) || event.button === 0;
      })
      .on('zoom', (event) => {
        viewport.attr('transform', event.transform.toString());
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    return () => {
      simulation.stop();
      svg.on('.zoom', null);
    };
  }, [bubbles, title]);

  const zoomIn = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy, 1.2);
  };

  const zoomOut = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy, 0.8);
  };

  const resetZoom = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(250)
      .call(zoomRef.current.transform, d3.zoomIdentity);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <button type="button" onClick={zoomIn} aria-label="Zoom in">+</button>
        <button type="button" onClick={zoomOut} aria-label="Zoom out">-</button>
        <button type="button" onClick={resetZoom} aria-label="Reset zoom">Reset</button>
      </div>
      <svg ref={svgRef} className={styles.svg} />
    </div>
  );
}

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
  const b = Math.min(255, (num & 0x0000ff) + amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

