import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

interface Node {
  id: number;
  x: number;
  y: number;
  label: string;
}

interface Edge {
  from: number;
  to: number;
}

const NODES: Node[] = [
  { id: 0, x: 150, y: 50, label: 'C' },
  { id: 1, x: 80, y: 120, label: 'O' },
  { id: 2, x: 220, y: 120, label: 'O' },
  { id: 3, x: 150, y: 180, label: 'H' },
  { id: 4, x: 50, y: 180, label: 'H' },
];

const EDGES: Edge[] = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 0, to: 3 },
  { from: 1, to: 4 },
];

export function MessagePassingViz() {
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [messagePhase, setMessagePhase] = useState<'collect' | 'update'>('collect');

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        if (messagePhase === 'collect') {
          setMessagePhase('update');
        } else {
          setMessagePhase('collect');
          setStep(s => {
            if (s >= 2) {
              setIsAnimating(false);
              return 0;
            }
            return s + 1;
          });
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, messagePhase]);

  const runAnimation = () => {
    setStep(0);
    setMessagePhase('collect');
    setIsAnimating(true);
  };

  const getNodeColor = (id: number): string => {
    const baseColors = ['rgb(99, 102, 241)', 'rgb(239, 68, 68)', 'rgb(239, 68, 68)', 'rgb(156, 163, 175)', 'rgb(156, 163, 175)'];
    return baseColors[id];
  };

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Neural Message Passing</h3>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-text-secondary">Layer {step + 1}/3</span>
          <button
            onClick={runAnimation}
            disabled={isAnimating}
            className="px-3 py-1 text-xs rounded-md border border-accent text-accent hover:bg-accent/10 disabled:opacity-50"
          >
            {isAnimating ? 'Running...' : 'Run MPNN'}
          </button>
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4 mb-4">
        <svg width="100%" height="220" viewBox="0 0 300 220">
          {EDGES.map((edge, i) => {
            const from = NODES[edge.from];
            const to = NODES[edge.to];
            return (
              <g key={i}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="rgb(75, 85, 99)"
                  strokeWidth="2"
                />
                {isAnimating && messagePhase === 'collect' && (
                  <motion.circle
                    r={6}
                    fill="rgb(249, 115, 22)"
                    initial={{ cx: from.x, cy: from.y, opacity: 0 }}
                    animate={{ cx: to.x, cy: to.y, opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 0.8 }}
                  />
                )}
              </g>
            );
          })}
          
          {NODES.map((node) => (
            <g key={node.id}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={20}
                fill={getNodeColor(node.id)}
                animate={{
                  scale: isAnimating && messagePhase === 'update' ? [1, 1.2, 1] : 1,
                }}
                transition={{ duration: 0.5 }}
              />
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontWeight="bold"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
        <div className="text-center text-xs text-text-secondary mt-2">
          Example: Formaldehyde (CH₂O) molecule
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4 mb-4">
        <div className="text-sm font-medium mb-2">
          Phase: {messagePhase === 'collect' ? 'Message Collection' : 'Node Update'}
        </div>
        <div className="font-mono text-xs bg-bg-secondary p-2 rounded">
          {messagePhase === 'collect' ? (
            <span>m<sub>v</sub> = Σ<sub>u∈N(v)</sub> M(h<sub>u</sub>, h<sub>v</sub>, e<sub>uv</sub>)</span>
          ) : (
            <span>h<sub>v</sub><sup>new</sup> = U(h<sub>v</sub>, m<sub>v</sub>)</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-bg rounded-lg border border-border text-center">
          <div className="text-lg font-bold text-accent">M</div>
          <div className="text-xs text-text-secondary">Message Function</div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border text-center">
          <div className="text-lg font-bold text-green-500">U</div>
          <div className="text-xs text-text-secondary">Update Function</div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border text-center">
          <div className="text-lg font-bold text-orange-500">R</div>
          <div className="text-xs text-text-secondary">Readout Function</div>
        </div>
      </div>
    </div>
  );
}
