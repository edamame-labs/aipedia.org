import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';
import { createRng } from '../../lib/rng';

interface Point {
  x: number;
  y: number;
  id: number;
}

function generatePoints(n: number, seed: number): Point[] {
  const random = createRng(seed);
  return Array.from({ length: n }, (_, i) => ({
    x: 20 + random() * 260,
    y: 20 + random() * 160,
    id: i,
  }));
}

function computeConvexHull(points: Point[]): number[] {
  if (points.length < 3) return points.map(p => p.id);
  
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  
  const cross = (o: Point, a: Point, b: Point) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  
  const lower: Point[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  
  const upper: Point[] = [];
  for (const p of sorted.reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  
  lower.pop();
  upper.pop();
  
  return [...lower, ...upper].map(p => p.id);
}

export function PointerNetViz() {
  const [numPoints, setNumPoints] = useState(8);
  const [showHull, setShowHull] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [round, setRound] = useState(0);

  const points = useMemo(
    () => generatePoints(numPoints, 33961 + round * 7919 + numPoints),
    [numPoints, round]
  );
  const hull = useMemo(() => computeConvexHull(points), [points]);
  const hullPoints = hull.map(id => points.find(p => p.id === id)!);

  const regenerate = useCallback(() => {
    setRound(r => r + 1);
    setShowHull(false);
    setAnimationStep(0);
  }, []);

  const animateHull = useCallback(() => {
    setShowHull(true);
    setAnimationStep(0);
    const interval = setInterval(() => {
      setAnimationStep(s => {
        if (s >= hull.length) {
          clearInterval(interval);
          return s;
        }
        return s + 1;
      });
    }, 500);
  }, [hull.length]);

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Pointer Networks</h3>
        <div className="flex gap-2">
          <button
            onClick={regenerate}
            className="px-3 py-1 text-xs rounded-md border border-border hover:border-accent"
          >
            New Points
          </button>
          <button
            onClick={animateHull}
            className="px-3 py-1 text-xs rounded-md border border-accent text-accent hover:bg-accent/10"
          >
            Find Hull
          </button>
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-2 mb-4">
        <svg width="300" height="200" className="w-full">
          {showHull && animationStep > 0 && (
            <motion.polygon
              points={hullPoints.slice(0, animationStep).map(p => `${p.x},${p.y}`).join(' ')}
              fill="rgba(99, 102, 241, 0.1)"
              stroke="rgb(99, 102, 241)"
              strokeWidth="2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}
          
          {showHull && animationStep > 0 && hullPoints.slice(0, animationStep).map((p, i) => {
            const next = hullPoints[(i + 1) % Math.min(animationStep, hullPoints.length)];
            if (i >= animationStep - 1 && animationStep < hullPoints.length) return null;
            return (
              <motion.line
                key={`line-${i}`}
                x1={p.x}
                y1={p.y}
                x2={next.x}
                y2={next.y}
                stroke="rgb(99, 102, 241)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3 }}
              />
            );
          })}
          
          {points.map((p, i) => (
            <motion.g key={p.id}>
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={hull.includes(p.id) && showHull ? 10 : 8}
                fill={hull.includes(p.id) && showHull ? 'rgb(99, 102, 241)' : 'rgb(75, 85, 99)'}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
              />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fill="white"
                fontSize="10"
              >
                {i}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4 mb-4">
        <div className="text-sm font-medium mb-2">Pointer Output</div>
        <div className="flex gap-1 flex-wrap">
          {hull.map((id, i) => (
            <motion.div
              key={i}
              className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium ${
                showHull && i < animationStep
                  ? 'bg-accent text-white'
                  : 'bg-bg-secondary text-text-secondary'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              {id}
            </motion.div>
          ))}
          <div className="w-8 h-8 rounded flex items-center justify-center text-sm bg-bg-secondary text-text-secondary">
            →
          </div>
        </div>
        <div className="text-xs text-text-secondary mt-2">
          Output is a sequence of pointers to input positions
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">Variable Output Size</div>
          <div className="text-xs text-text-secondary">
            Output length depends on input—impossible with fixed vocabulary
          </div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">Attention as Output</div>
          <div className="text-xs text-text-secondary">
            Attention weights become the output distribution over inputs
          </div>
        </div>
      </div>
    </div>
  );
}
