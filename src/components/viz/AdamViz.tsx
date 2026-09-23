import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

type Point = { x: number; y: number };
type Optimizer = 'sgd' | 'momentum' | 'adam';

// Elongated quadratic loss function centered at GOAL (3, 0.5)
// f(x, y) = 0.1*(x-3)² + 0.5*(y-0.5)² - elongated along x-axis
const GOAL: Point = { x: 3, y: 0.5 };

function lossFunction(x: number, y: number): number {
  const dx = x - GOAL.x;
  const dy = y - GOAL.y;
  return 0.1 * dx * dx + 0.5 * dy * dy;
}

function gradient(x: number, y: number): [number, number] {
  const dx = x - GOAL.x;
  const dy = y - GOAL.y;
  return [0.2 * dx, 1.0 * dy];
}

function optimizerStep(
  pos: Point,
  state: { m: Point; v: Point; vMom: Point; t: number },
  optimizer: Optimizer,
  lr: number
): { pos: Point; state: typeof state } {
  const [gx, gy] = gradient(pos.x, pos.y);
  const beta1 = 0.9;
  const beta2 = 0.999;
  const eps = 1e-8;
  let newPos: Point;
  const newState = { ...state, t: state.t + 1 };

  switch (optimizer) {
    case 'sgd':
      newPos = {
        x: pos.x - lr * gx,
        y: pos.y - lr * gy,
      };
      break;

    case 'momentum':
      newState.vMom = {
        x: 0.9 * state.vMom.x + gx,
        y: 0.9 * state.vMom.y + gy,
      };
      newPos = {
        x: pos.x - lr * newState.vMom.x,
        y: pos.y - lr * newState.vMom.y,
      };
      break;

    case 'adam':
      newState.m = {
        x: beta1 * state.m.x + (1 - beta1) * gx,
        y: beta1 * state.m.y + (1 - beta1) * gy,
      };
      newState.v = {
        x: beta2 * state.v.x + (1 - beta2) * gx * gx,
        y: beta2 * state.v.y + (1 - beta2) * gy * gy,
      };
      const mHat = {
        x: newState.m.x / (1 - Math.pow(beta1, newState.t)),
        y: newState.m.y / (1 - Math.pow(beta1, newState.t)),
      };
      const vHat = {
        x: newState.v.x / (1 - Math.pow(beta2, newState.t)),
        y: newState.v.y / (1 - Math.pow(beta2, newState.t)),
      };
      newPos = {
        x: pos.x - (lr * mHat.x) / (Math.sqrt(vHat.x) + eps),
        y: pos.y - (lr * mHat.y) / (Math.sqrt(vHat.y) + eps),
      };
      break;
  }

  return { pos: newPos, state: newState };
}

const COLORS: Record<Optimizer, string> = {
  sgd: 'rgb(239, 68, 68)',
  momentum: 'rgb(34, 197, 94)',
  adam: 'rgb(99, 102, 241)',
};

const INITIAL_POS: Point = { x: -1.5, y: 1.5 };

export function AdamViz() {
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedOptimizer, setSelectedOptimizer] = useState<Optimizer>('adam');
  const [paths, setPaths] = useState<Record<Optimizer, Point[]>>({
    sgd: [INITIAL_POS],
    momentum: [INITIAL_POS],
    adam: [INITIAL_POS],
  });
  const statesRef = useRef<Record<Optimizer, { m: Point; v: Point; vMom: Point; t: number }>>({
    sgd: { m: { x: 0, y: 0 }, v: { x: 0, y: 0 }, vMom: { x: 0, y: 0 }, t: 0 },
    momentum: { m: { x: 0, y: 0 }, v: { x: 0, y: 0 }, vMom: { x: 0, y: 0 }, t: 0 },
    adam: { m: { x: 0, y: 0 }, v: { x: 0, y: 0 }, vMom: { x: 0, y: 0 }, t: 0 },
  });

  const maxSteps = 100;
  const lr = 0.1;

  useEffect(() => {
    if (isRunning && step < maxSteps) {
      const timer = setTimeout(() => {
        setPaths((prev) => {
          const newPaths = { ...prev };
          const states = statesRef.current;

          (['sgd', 'momentum', 'adam'] as Optimizer[]).forEach((opt) => {
            const currentPath = prev[opt];
            const currentPos = currentPath[currentPath.length - 1];
            const { pos: newPos, state: newState } = optimizerStep(
              currentPos,
              states[opt],
              opt,
              lr
            );
            states[opt] = newState;
            newPaths[opt] = [...currentPath, newPos];
          });

          return newPaths;
        });
        setStep((s) => s + 1);
      }, 50);
      return () => clearTimeout(timer);
    } else if (step >= maxSteps) {
      setIsRunning(false);
    }
  }, [isRunning, step]);

  const reset = () => {
    setStep(0);
    setIsRunning(false);
    setPaths({
      sgd: [INITIAL_POS],
      momentum: [INITIAL_POS],
      adam: [INITIAL_POS],
    });
    statesRef.current = {
      sgd: { m: { x: 0, y: 0 }, v: { x: 0, y: 0 }, vMom: { x: 0, y: 0 }, t: 0 },
      momentum: { m: { x: 0, y: 0 }, v: { x: 0, y: 0 }, vMom: { x: 0, y: 0 }, t: 0 },
      adam: { m: { x: 0, y: 0 }, v: { x: 0, y: 0 }, vMom: { x: 0, y: 0 }, t: 0 },
    };
  };

  // Convert coordinates to SVG space
  const toSVG = (p: Point): Point => ({
    x: ((p.x + 2) / 6) * 400,
    y: ((2 - p.y) / 4) * 300,
  });

  const currentLosses = {
    sgd: lossFunction(paths.sgd[paths.sgd.length - 1].x, paths.sgd[paths.sgd.length - 1].y),
    momentum: lossFunction(paths.momentum[paths.momentum.length - 1].x, paths.momentum[paths.momentum.length - 1].y),
    adam: lossFunction(paths.adam[paths.adam.length - 1].x, paths.adam[paths.adam.length - 1].y),
  };

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Optimizer Comparison</h3>
        <div className="flex gap-2">
          <span className="text-sm text-text-secondary">Step: {step}/{maxSteps}</span>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-3 py-1 text-xs rounded-md border border-accent text-accent hover:bg-accent/10"
          >
            {isRunning ? 'Pause' : 'Run'}
          </button>
          <button
            onClick={reset}
            className="px-3 py-1 text-xs rounded-md border border-border text-text-secondary hover:border-accent"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs">
        {(['sgd', 'momentum', 'adam'] as Optimizer[]).map((opt) => (
          <button
            key={opt}
            onClick={() => setSelectedOptimizer(opt)}
            className={`flex items-center gap-1 px-2 py-1 rounded border ${
              selectedOptimizer === opt ? 'border-white/30' : 'border-transparent'
            }`}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[opt] }}
            />
            <span style={{ color: COLORS[opt] }}>
              {opt === 'sgd' ? 'SGD' : opt === 'momentum' ? 'Momentum' : 'Adam'}
            </span>
          </button>
        ))}
      </div>

      {/* Loss landscape visualization */}
      <div className="bg-bg rounded-lg border border-border p-2 mb-4">
        <svg width="100%" height="300" viewBox="0 0 400 300">
          {/* Contour lines (simplified) */}
          {[0.1, 0.5, 1, 2, 5, 10].map((level, i) => (
            <circle
              key={i}
              cx={toSVG(GOAL).x}
              cy={toSVG(GOAL).y}
              r={level * 20}
              fill="none"
              stroke="rgb(55, 65, 81)"
              strokeWidth="1"
            />
          ))}

          {/* Paths */}
          {(['sgd', 'momentum', 'adam'] as Optimizer[]).map((opt) => {
            const path = paths[opt];
            if (path.length < 2) return null;
            const svgPath = path.map(toSVG);
            const d = svgPath.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
            return (
              <motion.path
                key={opt}
                d={d}
                fill="none"
                stroke={COLORS[opt]}
                strokeWidth={selectedOptimizer === opt ? 3 : 1.5}
                strokeOpacity={selectedOptimizer === opt ? 1 : 0.5}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            );
          })}

          {/* Current positions */}
          {(['sgd', 'momentum', 'adam'] as Optimizer[]).map((opt) => {
            const pos = toSVG(paths[opt][paths[opt].length - 1]);
            return (
              <motion.circle
                key={`pos-${opt}`}
                cx={pos.x}
                cy={pos.y}
                r={selectedOptimizer === opt ? 8 : 5}
                fill={COLORS[opt]}
                animate={{ cx: pos.x, cy: pos.y }}
              />
            );
          })}

          {/* Goal */}
          <circle
            cx={toSVG(GOAL).x}
            cy={toSVG(GOAL).y}
            r={6}
            fill="rgb(250, 204, 21)"
            stroke="white"
            strokeWidth="2"
          />
          <text
            x={toSVG(GOAL).x + 12}
            y={toSVG(GOAL).y + 4}
            className="text-xs fill-current text-yellow-400"
          >
            Goal
          </text>

          {/* Start */}
          <text
            x={toSVG(INITIAL_POS).x - 30}
            y={toSVG(INITIAL_POS).y - 10}
            className="text-xs fill-current text-text-secondary"
          >
            Start
          </text>
        </svg>
      </div>

      {/* Current losses */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {(['sgd', 'momentum', 'adam'] as Optimizer[]).map((opt) => (
          <div
            key={opt}
            className="p-2 bg-bg rounded-lg border border-border text-center"
          >
            <div className="text-xs text-text-secondary">
              {opt === 'sgd' ? 'SGD' : opt === 'momentum' ? 'Momentum' : 'Adam'}
            </div>
            <div className="font-mono text-sm" style={{ color: COLORS[opt] }}>
              {currentLosses[opt].toFixed(4)}
            </div>
          </div>
        ))}
      </div>

      {/* Algorithm details */}
      <div className="p-4 bg-bg rounded-lg border border-border">
        <div className="text-sm font-medium mb-2" style={{ color: COLORS[selectedOptimizer] }}>
          {selectedOptimizer === 'sgd' && 'Stochastic Gradient Descent'}
          {selectedOptimizer === 'momentum' && 'SGD with Momentum'}
          {selectedOptimizer === 'adam' && 'Adam (Adaptive Moment Estimation)'}
        </div>
        <div className="font-mono text-xs text-text-secondary">
          {selectedOptimizer === 'sgd' && 'θ = θ - α · ∇L'}
          {selectedOptimizer === 'momentum' && 'v = βv + ∇L; θ = θ - α · v'}
          {selectedOptimizer === 'adam' && (
            <>
              m = β₁m + (1-β₁)∇L<br />
              v = β₂v + (1-β₂)∇L²<br />
              θ = θ - α · m̂ / (√v̂ + ε)
            </>
          )}
        </div>
      </div>
    </div>
  );
}
