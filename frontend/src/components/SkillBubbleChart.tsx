import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { SkillBubble } from '../types';
import styles from './BubbleChart.module.css';

interface Props {
  bubbles: SkillBubble[];
  title: string;
  onBubbleClick?: (bubble: SkillBubble) => void;
  selectedBubbleId?: string;
}

type Node = SkillBubble & d3.SimulationNodeDatum & { r: number; x: number; y: number };

export default function SkillBubbleChart({ bubbles, title, onBubbleClick, selectedBubbleId }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    if (!svgRef.current || bubbles.length === 0) return;

    const width = svgRef.current.clientWidth || 900;
    const height = svgRef.current.clientHeight || 650;
    const cx = width / 2;
    const cy = height / 2;

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);
    svg.selectAll('*').remove();
    const viewport = svg.append('g');
    viewport.append('rect').attr('width', width).attr('height', height).attr('fill', 'transparent').style('pointer-events', 'all');

    const maxRadius = Math.max(...bubbles.map((b) => b.radius));
    const scaleFactor = Math.min(width, height) / (maxRadius * 4.5);

    const nodes: Node[] = bubbles.map((b) => {
      const r = Math.max(b.radius * scaleFactor, 18);
      // Use clusterAngle for initial position so related skills cluster together
      const angle = b.clusterAngle != null ? (b.clusterAngle * Math.PI) / 180 : Math.random() * Math.PI * 2;
      const spread = Math.min(width, height) * 0.3;
      return {
        ...b,
        r,
        x: cx + Math.cos(angle) * spread * (0.5 + Math.random() * 0.5),
        y: cy + Math.sin(angle) * spread * (0.5 + Math.random() * 0.5),
      };
    });

    const simulation = d3
      .forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(4))
      .force('center', d3.forceCenter(cx, cy).strength(0.05))
      .force('collision', d3.forceCollide<Node>().radius((d) => d.r + 4))
      .stop();

    for (let i = 0; i < 300; i++) simulation.tick();

    const defs = svg.append('defs');
    const g = viewport.append('g');

    const bubbleG = g
      .selectAll('g.bubble')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'bubble')
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .style('cursor', onBubbleClick ? 'pointer' : 'default');

    // Glow
    bubbleG.append('circle')
      .attr('r', (d) => d.r + (d.id === selectedBubbleId ? 14 : 8))
      .attr('fill', (d) => d.color)
      .attr('opacity', (d) => d.id === selectedBubbleId ? 0.35 : 0.13);

    // Main circle
    bubbleG.append('circle')
      .attr('r', (d) => d.r)
      .attr('fill', (d) => {
        const grad = defs.append('radialGradient').attr('id', `sgrad-${d.id}`);
        grad.append('stop').attr('offset', '0%').attr('stop-color', lighten(d.color, 45));
        grad.append('stop').attr('offset', '100%').attr('stop-color', d.color);
        return `url(#sgrad-${d.id})`;
      })
      .attr('stroke', (d) => d.id === selectedBubbleId ? '#fff' : d.color)
      .attr('stroke-width', (d) => d.id === selectedBubbleId ? 2.5 : 1.5)
      .attr('opacity', 0.92);

    // Label
    bubbleG.append('text')
      .text((d) => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.r > 30 ? '-0.3em' : '0.35em')
      .attr('fill', '#fff')
      .attr('font-size', (d) => Math.max(d.r / 3.5, 9))
      .attr('font-weight', '700')
      .attr('font-family', 'Inter, sans-serif');

    // Value (person count or proficiency) – only if bubble is big enough
    bubbleG.filter((d) => d.r > 30)
      .append('text')
      .text((d) => d.personNames ? `${d.value} Pers.` : `${d.value}%`)
      .attr('text-anchor', 'middle')
      .attr('dy', '1.1em')
      .attr('fill', 'rgba(255,255,255,0.7)')
      .attr('font-size', (d) => Math.max(d.r / 5.5, 8))
      .attr('font-family', 'Inter, sans-serif');

    if (onBubbleClick) {
      bubbleG.on('click', (_event, d) => onBubbleClick(d as SkillBubble));
    }

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 5])
      .filter((e) => e.type === 'wheel' || e.type.startsWith('touch') || (e instanceof MouseEvent && e.button === 0))
      .on('zoom', (event) => viewport.attr('transform', event.transform.toString()));
    zoomRef.current = zoom;
    svg.call(zoom);

    return () => { simulation.stop(); svg.on('.zoom', null); };
  }, [bubbles, title, selectedBubbleId, onBubbleClick]);

  const zoomIn  = () => { if (svgRef.current && zoomRef.current) d3.select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy, 1.2); };
  const zoomOut = () => { if (svgRef.current && zoomRef.current) d3.select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy, 0.8); };
  const reset   = () => { if (svgRef.current && zoomRef.current) d3.select(svgRef.current).transition().duration(250).call(zoomRef.current.transform, d3.zoomIdentity); };

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <button type="button" onClick={zoomIn} aria-label="Zoom in">+</button>
        <button type="button" onClick={zoomOut} aria-label="Zoom out">-</button>
        <button type="button" onClick={reset} aria-label="Reset zoom">Reset</button>
      </div>
      <svg ref={svgRef} className={styles.svg} />
    </div>
  );
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

