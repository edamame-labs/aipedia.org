import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

/**
 * Visualizes the core MaxRL insight: the ML objective's Maclaurin expansion
 * and how standard RL only optimizes the first-order term while MaxRL
 * captures higher-order terms via pass@k gradients.
 */

function logML(p: number): number {
  // log(p) — the true maximum likelihood objective
  if (p <= 0) return -10;
  return Math.log(p);
}

function rlApprox(p: number, K: number): number {
  // Truncated Maclaurin: -Σ_{k=1}^{K} (1-p)^k / k
  let sum = 0;
  for (let k = 1; k <= K; k++) {
    sum += Math.pow(1 - p, k) / k;
  }
  return -sum;
}

export function MaxLikelihoodRLViz() {
  const [maxK, setMaxK] = useState(1); // How many terms in the expansion
  const [highlightP, setHighlightP] = useState(0.3);

  const NUM_POINTS = 100;

  const curves = useMemo(() => {
    const points: number[] = [];
    for (let i = 1; i <= NUM_POINTS; i++) {
      points.push(i / NUM_POINTS);
    }

    const mlCurve = points.map(p => ({ p, v: logML(p) }));

    const approxCurves: { k: number; data: { p: number; v: number }[] }[] = [];
    for (let K = 1; K <= 5; K++) {
      approxCurves.push({
        k: K,
        data: points.map(p => ({ p, v: rlApprox(p, K) })),
      });
    }

    return { points, mlCurve, approxCurves };
  }, []);

  // SVG chart dimensions
  const W = 400;
  const H = 200;
  const PAD = { top: 10, right: 20, bottom: 30, left: 45 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const yMin = -5;
  const yMax = 0.2;

  const toX = useCallback((p: number) => PAD.left + p * plotW, [plotW]);
  const toY = useCallback(
    (v: number) => PAD.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH,
    [plotH]
  );

  const makePath = useCallback(
    (data: { p: number; v: number }[]) => {
      return data
        .map((d, i) => {
          const x = toX(d.p);
          const y = toY(Math.max(yMin, Math.min(yMax, d.v)));
          return `${i === 0 ? 'M' : 'L'}${x},${y}`;
        })
        .join(' ');
    },
    [toX, toY]
  );

  const mlPath = useMemo(() => makePath(curves.mlCurve), [makePath, curves.mlCurve]);

  const approxPaths = useMemo(
    () => curves.approxCurves.map(c => ({ k: c.k, path: makePath(c.data) })),
    [makePath, curves.approxCurves]
  );

  const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'];

  // Compute values at highlighted point
  const mlVal = logML(highlightP);
  const approxVals = Array.from({ length: 5 }, (_, i) => rlApprox(highlightP, i + 1));

  // Individual term contributions
  const terms = Array.from({ length: 5 }, (_, k) => {
    return -Math.pow(1 - highlightP, k + 1) / (k + 1);
  });

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <h3 className="text-lg font-semibold mb-1">MaxRL: Maclaurin Expansion of log(p)</h3>
      <p className="text-sm text-text-secondary mb-4">
        The ML objective log(p) can be expanded as −Σ (1−p)<sup>k</sup>/k.
        Standard RL (REINFORCE) only optimizes the k=1 term. MaxRL adds higher-order terms.
      </p>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto mb-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[500px] mx-auto">
          {/* Grid lines */}
          {[-4, -3, -2, -1, 0].map(v => (
            <g key={v}>
              <line
                x1={PAD.left} y1={toY(v)} x2={W - PAD.right} y2={toY(v)}
                stroke="currentColor" opacity={0.1} strokeDasharray="3,3"
              />
              <text x={PAD.left - 5} y={toY(v) + 3} textAnchor="end"
                className="fill-text-secondary" fontSize={9}>{v}</text>
            </g>
          ))}
          {/* X axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map(p => (
            <text key={p} x={toX(p)} y={H - 5} textAnchor="middle"
              className="fill-text-secondary" fontSize={9}>{p}</text>
          ))}
          <text x={toX(0.5)} y={H} textAnchor="middle" className="fill-text-secondary" fontSize={9}>
            p (pass rate)
          </text>

          {/* Approximation curves (up to selected K) */}
          {approxPaths.map(({ k, path }) => (
            <path
              key={k}
              d={path}
              fill="none"
              stroke={COLORS[k - 1]}
              strokeWidth={k <= maxK ? 2 : 0.5}
              opacity={k <= maxK ? 0.9 : 0.15}
              strokeDasharray={k <= maxK ? undefined : '4,4'}
            />
          ))}

          {/* True ML curve */}
          <path d={mlPath} fill="none" stroke="currentColor" strokeWidth={2.5} opacity={0.8} />

          {/* Vertical highlight line */}
          <line
            x1={toX(highlightP)} y1={PAD.top}
            x2={toX(highlightP)} y2={H - PAD.bottom}
            stroke="currentColor" opacity={0.2} strokeDasharray="2,2"
          />
          {/* Dots at highlighted p */}
          <circle cx={toX(highlightP)} cy={toY(Math.max(yMin, mlVal))} r={4}
            fill="currentColor" opacity={0.8} />
          {Array.from({ length: maxK }, (_, i) => (
            <circle key={i} cx={toX(highlightP)}
              cy={toY(Math.max(yMin, Math.min(yMax, approxVals[i])))}
              r={3} fill={COLORS[i]} />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center mb-5 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-4 h-[2px] bg-current inline-block" /> log(p) (exact ML)
        </span>
        {COLORS.slice(0, 5).map((c, i) => (
          <span key={i} className={`flex items-center gap-1 ${i >= maxK ? 'opacity-30' : ''}`}>
            <span className="w-4 h-[2px] inline-block" style={{ backgroundColor: c }} />
            K={i + 1}
          </span>
        ))}
      </div>

      {/* K slider */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">Expansion order K (number of pass@k terms)</span>
          <span className="font-mono text-text-secondary">{maxK}</span>
        </div>
        <input
          type="range" min={1} max={5} step={1} value={maxK}
          onChange={e => setMaxK(parseInt(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="flex justify-between text-[10px] text-text-secondary">
          <span>K=1 (standard RL)</span>
          <span>K=5 (closer to ML)</span>
        </div>
      </div>

      {/* p slider */}
      <div className="mb-5">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">Pass rate p</span>
          <span className="font-mono text-text-secondary">{highlightP.toFixed(2)}</span>
        </div>
        <input
          type="range" min={0.02} max={0.98} step={0.01} value={highlightP}
          onChange={e => setHighlightP(parseFloat(e.target.value))}
          className="w-full accent-accent"
        />
      </div>

      {/* Term breakdown */}
      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Term contributions at p = {highlightP.toFixed(2)}</div>
        <div className="space-y-1">
          {terms.slice(0, maxK).map((t, i) => {
            const maxAbs = Math.max(...terms.map(Math.abs), 0.01);
            return (
              <motion.div
                key={i}
                className="flex items-center gap-2 text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="w-24 text-right font-mono text-text-secondary">
                  −(1−p)<sup>{i + 1}</sup>/{i + 1}
                </span>
                <div className="flex-1 h-4 bg-bg rounded overflow-hidden">
                  <motion.div
                    className="h-4 rounded"
                    style={{ backgroundColor: COLORS[i] }}
                    animate={{ width: `${(Math.abs(t) / maxAbs) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="w-14 font-mono text-right">{t.toFixed(3)}</span>
              </motion.div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs border-t border-border pt-2">
          <span className="text-text-secondary">
            Sum (K={maxK} approx): <span className="font-mono">{approxVals[maxK - 1].toFixed(3)}</span>
          </span>
          <span className="text-text-secondary">
            Exact log(p): <span className="font-mono">{mlVal.toFixed(3)}</span>
          </span>
        </div>
      </div>

      {/* Insight box */}
      <div className="p-3 bg-bg rounded-lg border border-border">
        <p className="text-xs text-text-secondary">
          <span className="text-accent font-medium">Key insight:</span> When p is small (hard problems),
          the k=1 term alone is a poor approximation — higher-order terms matter most.
          MaxRL captures these terms, producing stronger gradients on hard prompts where
          standard RL struggles. At low p, notice how the K=1 curve diverges significantly from
          log(p), while adding more terms closes the gap.
        </p>
      </div>
    </div>
  );
}
