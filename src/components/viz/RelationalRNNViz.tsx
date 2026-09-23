import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';
import { createRng } from '../../lib/rng';

const MEMORY_SLOTS = 4;
const TIMESTEPS = 5;

export function RelationalRNNViz() {
  const [step, setStep] = useState(0);

  // Seeded per timestep: the weights should change as you step through, not
  // reshuffle on every unrelated re-render.
  const attentionWeights = useMemo(() => {
    const random = createRng(91354 + step * 7919);
    return Array.from({ length: MEMORY_SLOTS }, () =>
      Array.from({ length: MEMORY_SLOTS }, () => random())
    );
  }, [step]);

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Relational Memory Core</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="px-2 py-1 text-xs rounded border border-border disabled:opacity-30"
          >
            ←
          </button>
          <span className="text-xs text-text-secondary px-2 py-1">t = {step}</span>
          <button
            onClick={() => setStep(Math.min(TIMESTEPS - 1, step + 1))}
            disabled={step === TIMESTEPS - 1}
            className="px-2 py-1 text-xs rounded border border-border disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4 mb-4">
        <div className="text-xs text-text-secondary mb-3">Memory Slots (M)</div>
        <div className="flex justify-center gap-4 mb-4">
          {Array.from({ length: MEMORY_SLOTS }).map((_, i) => (
            <motion.div
              key={i}
              className="w-16 h-16 rounded-lg bg-accent flex items-center justify-center text-white font-medium"
              animate={{
                scale: 1 + Math.sin(step + i) * 0.1,
                opacity: 0.5 + attentionWeights[0][i] * 0.5,
              }}
            >
              m<sub>{i + 1}</sub>
            </motion.div>
          ))}
        </div>

        <div className="text-xs text-text-secondary mb-2">Attention between memories</div>
        <div className="flex justify-center">
          <svg width="200" height="60">
            {Array.from({ length: MEMORY_SLOTS }).map((_, i) =>
              Array.from({ length: MEMORY_SLOTS }).map((_, j) => {
                if (i === j) return null;
                const x1 = 25 + i * 50;
                const x2 = 25 + j * 50;
                const opacity = attentionWeights[i][j] * 0.8;
                return (
                  <motion.path
                    key={`${i}-${j}`}
                    d={`M ${x1} 10 Q ${(x1 + x2) / 2} ${40 + Math.abs(i - j) * 10} ${x2} 10`}
                    fill="none"
                    stroke="rgb(249, 115, 22)"
                    strokeWidth={opacity * 3}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1, opacity }}
                  />
                );
              })
            )}
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">Multi-Head Attention</div>
          <div className="text-xs text-text-secondary">
            Memory slots attend to each other via MHDPA (Multi-Head Dot Product Attention)
          </div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">Gated Update</div>
          <div className="text-xs text-text-secondary">
            Attended memories combined via gates, similar to LSTM
          </div>
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4">
        <div className="text-sm font-medium mb-2">Key Equation</div>
        <div className="font-mono text-xs bg-bg-secondary p-2 rounded">
          M<sup>t+1</sup> = MHDPA(M<sup>t</sup>) + MLP(MHDPA(M<sup>t</sup>))
        </div>
        <div className="text-xs text-text-secondary mt-2">
          Memories update by attending to each other—enabling relational reasoning over time
        </div>
      </div>
    </div>
  );
}
