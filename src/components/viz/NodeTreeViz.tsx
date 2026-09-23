import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const softmax = (xs: number[]) => {
  const m = Math.max(...xs);
  const exps = xs.map(x => Math.exp(x - m));
  const s = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / s);
};

export function NodeTreeViz() {
  const [temperature, setTemperature] = useState(1);
  const [useEntmax, setUseEntmax] = useState(false);
  const [hardCompare, setHardCompare] = useState(false);

  const samples = useMemo(() => [0.2, 0.4, 0.6, 0.8], []);

  const routing = useMemo(() => {
    const t = Math.max(temperature, 0.01);
    return samples.map(x => {
      const logits = [(0.5 - x) / t, (x - 0.5) / t];
      const probs = softmax(logits);
      return { x, probs };
    });
  }, [samples, temperature]);

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-text-secondary">Temperature: {temperature.toFixed(2)}</label>
          <input type="range" min="0.05" max="2" step="0.01" value={temperature} onChange={e => setTemperature(+e.target.value)} className="w-full accent-accent" />
        </div>
        <label className="flex items-center gap-2 text-xs text-text-secondary">
          <input type="checkbox" checked={useEntmax} onChange={e => setUseEntmax(e.target.checked)} />
          entmax routing
        </label>
        <label className="flex items-center gap-2 text-xs text-text-secondary">
          <input type="checkbox" checked={hardCompare} onChange={e => setHardCompare(e.target.checked)} />
          hard vs soft
        </label>
      </div>

      <svg width="420" height="220" className="mx-auto">
        <motion.rect x="0" y="0" width="420" height="220" fill="transparent" />

        {[0.3, 0.5, 0.7].map((thr, i) => (
          <motion.line
            key={i}
            x1={thr * 420}
            x2={thr * 420}
            y1={0}
            y2={220}
            stroke="#6366f1"
            strokeWidth={2}
            strokeDasharray="4 4"
            animate={{ opacity: Math.min(1, temperature) }}
          />
        ))}

        {routing.map((r, i) => (
          <motion.circle
            key={i}
            cx={r.x * 420}
            cy={110}
            r={10}
            fill="#22c55e"
            animate={{ cx: r.x * 420 }}
          />
        ))}
      </svg>

      <div className="text-xs text-text-secondary text-center">
        2D feature space with soft decision boundaries. Lower temperature sharpens splits.
      </div>

      <svg width="420" height="260" className="mx-auto">
        {routing.map((r, i) => (
          <motion.line
            key={i}
            x1={210}
            y1={40}
            x2={r.x * 420}
            y2={200}
            stroke="#3b82f6"
            strokeWidth={r.probs[0] * 6 + 1}
            strokeOpacity={r.probs[0]}
            animate={{ strokeWidth: r.probs[0] * 6 + 1, strokeOpacity: r.probs[0] }}
          />
        ))}

        <motion.circle cx={210} cy={40} r={22} className="fill-bg stroke-accent" strokeWidth={2} />
        <text x={210} y={44} textAnchor="middle" className="fill-text text-xs">oblivious</text>
      </svg>

      <div className="text-xs text-text-secondary text-center">
        Oblivious tree: same feature used at every depth. Thickness shows gradient flow during backprop.
      </div>
    </div>
  );
}
