import { useEffect, useMemo, useRef, useState } from 'react';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, type SimulationNodeDatum } from 'd3-force';
import { select } from 'd3-selection';
import { zoom, type D3ZoomEvent } from 'd3-zoom';
import { drag, type D3DragEvent } from 'd3-drag';

export interface GraphNode {
  id: string;
  nodeType: string;
  label: string;
}

export interface GraphEdge {
  sourceNodeId: string;
  targetNodeId: string;
}

interface SimNode extends SimulationNodeDatum {
  id: string;
  nodeType: string;
  label: string;
}

const NODE_COLOR: Record<string, string> = {
  empresa: '#9085e9',
  pessoa: '#3987e5',
  banco: '#16a34a',
  conta: '#fab219',
  ip: '#1fb5c9',
  dispositivo: '#d95926',
};

const NODE_RADIUS = 20;

export function NetworkGraph({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const width = 640;
  const height = 420;

  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  const simNodes = useMemo<SimNode[]>(
    () => nodes.map((n) => ({ id: n.id, nodeType: n.nodeType, label: n.label })),
    [nodes],
  );

  useEffect(() => {
    const simEdges = edges.map((e) => ({ source: e.sourceNodeId, target: e.targetNodeId }));

    const simulation = forceSimulation(simNodes)
      .force(
        'link',
        forceLink(simEdges)
          .id((d: any) => d.id)
          .distance(90),
      )
      .force('charge', forceManyBody().strength(-260))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collide', forceCollide(NODE_RADIUS + 8))
      .stop();

    for (let i = 0; i < 300; i++) simulation.tick();

    const next = new Map<string, { x: number; y: number }>();
    for (const n of simNodes) {
      next.set(n.id, { x: n.x ?? width / 2, y: n.y ?? height / 2 });
    }
    setPositions(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simNodes, edges]);

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    const svgSel = select(svgRef.current);
    const gSel = select(gRef.current);

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2.5])
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        gSel.attr('transform', event.transform.toString());
      });

    svgSel.call(zoomBehavior);

    return () => {
      svgSel.on('.zoom', null);
    };
  }, []);

  function attachDrag(nodeId: string) {
    return (element: SVGGElement | null) => {
      if (!element) return;

      const dragBehavior = drag<SVGGElement, unknown>()
        .on('drag', (event: D3DragEvent<SVGGElement, unknown, unknown>) => {
          setPositions((prev) => {
            const next = new Map(prev);
            next.set(nodeId, { x: event.x, y: event.y });
            return next;
          });
        });

      select(element).call(dragBehavior);
    };
  }

  return (
    <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="h-[420px] w-full cursor-grab rounded-md border border-border bg-background">
      <g ref={gRef}>
        {edges.map((edge, i) => {
          const source = positions.get(edge.sourceNodeId);
          const target = positions.get(edge.targetNodeId);
          if (!source || !target) return null;
          return (
            <line
              key={i}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke="var(--border)"
              strokeWidth={1.5}
            />
          );
        })}

        {nodes.map((node) => {
          const pos = positions.get(node.id);
          if (!pos) return null;
          return (
            <g key={node.id} ref={attachDrag(node.id)} transform={`translate(${pos.x}, ${pos.y})`} className="cursor-move">
              <circle r={NODE_RADIUS} fill={NODE_COLOR[node.nodeType] ?? '#8a9ab0'} fillOpacity={0.85} stroke="var(--background)" strokeWidth={2} />
              <text textAnchor="middle" dy={NODE_RADIUS + 14} fontSize={10} fill="var(--muted)">
                {node.label.length > 16 ? `${node.label.slice(0, 16)}…` : node.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
