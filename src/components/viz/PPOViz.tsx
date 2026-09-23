import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

export function PPOViz() {
  const [ratio, setRatio] = useState(1.0);
  const [advantage, setAdvantage] = useState(1.0);
  const [epsilon] = useState(0.2);

  const clippedRatio = Math.max(1 - epsilon, Math.min(1 + epsilon, ratio));
  const unclippedObj = ratio * advantage;
  const clippedObj = clippedRatio * advantage;
  const ppoObj = Math.min(unclippedObj, clippedObj);

  const graphPoints = useMemo(() => {
    const points = [];
    for (let r = 0.5; r <= 1.5; r += 0.02) {
      const clipped = Math.max(1 - epsilon, Math.min(1 + epsilon, r));
      const obj = Math.min(r * advantage, clipped * advantage);
      points.push({ r, obj });
    }
    return points;
  }, [advantage, epsilon]);

  const maxObj = Math.max(...graphPoints.map(p => Math.abs(p.obj)));
  const graphWidth = 300;
  const graphHeight = 150;

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">PPO Clipping Mechanism</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-text-secondary">
            Probability Ratio r(θ): {ratio.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.01"
            value={ratio}
            onChange={e => setRatio(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-text-secondary">
            Advantage Â: {advantage.toFixed(1)}
          </label>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={advantage}
            onChange={e => setAdvantage(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <svg width={graphWidth} height={graphHeight} className="border border-border rounded">
          {/* Clip region */}
          <rect
            x={(0.8 / 1) * graphWidth / 1.5 + graphWidth / 6}
            y={0}
            width={(0.4 / 1.5) * graphWidth}
            height={graphHeight}
            fill="rgba(99,102,241,0.1)"
          />
          
          {/* Axis */}
          <line x1={0} y1={graphHeight / 2} x2={graphWidth} y2={graphHeight / 2} stroke="var(--border)" />
          <line x1={graphWidth / 3} y1={0} x2={graphWidth / 3} y2={graphHeight} stroke="var(--border)" strokeDasharray="4" />
          
          {/* PPO objective curve */}
          <path
            d={graphPoints.map((p, i) => {
              const x = ((p.r - 0.5) / 1) * graphWidth;
              const y = graphHeight / 2 - (p.obj / (maxObj || 1)) * (graphHeight / 2 - 10);
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2}
          />

          {/* Current point */}
          <motion.circle
            cx={((ratio - 0.5) / 1) * graphWidth}
            cy={graphHeight / 2 - (ppoObj / (maxObj || 1)) * (graphHeight / 2 - 10)}
            r={6}
            fill="var(--accent)"
            animate={{
              cx: ((ratio - 0.5) / 1) * graphWidth,
              cy: graphHeight / 2 - (ppoObj / (maxObj || 1)) * (graphHeight / 2 - 10),
            }}
          />

          {/* Labels */}
          <text x={graphWidth / 3} y={graphHeight - 5} textAnchor="middle" className="text-xs fill-text-secondary">r=1</text>
          <text x={10} y={graphHeight - 5} className="text-xs fill-text-secondary">0.5</text>
          <text x={graphWidth - 20} y={graphHeight - 5} className="text-xs fill-text-secondary">1.5</text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-bg rounded border border-border">
          <div className="text-xs text-text-secondary">Unclipped</div>
          <div className="font-mono text-sm">{unclippedObj.toFixed(2)}</div>
        </div>
        <div className="p-2 bg-bg rounded border border-border">
          <div className="text-xs text-text-secondary">Clipped</div>
          <div className="font-mono text-sm">{clippedObj.toFixed(2)}</div>
        </div>
        <div className="p-2 bg-accent/10 rounded border border-accent">
          <div className="text-xs text-accent">PPO Objective</div>
          <div className="font-mono text-sm text-accent">{ppoObj.toFixed(2)}</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-bg rounded-lg border border-border">
        <p className="text-xs text-text-secondary">
          <span className="text-accent font-medium">Insight:</span> When advantage is positive, PPO prevents
          the ratio from going above 1+ε. When negative, it prevents going below 1-ε.
          This keeps updates "proximal" to the old policy.
        </p>
      </div>
    </div>
  );
}
