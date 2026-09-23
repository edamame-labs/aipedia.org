import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';
import { createRng } from '../../lib/rng';

function shuffleArray<T>(arr: T[], seed: number): T[] {
  const random = createRng(seed);
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const ORIGINAL = [3, 1, 4, 1, 5, 9, 2, 6];

export function OrderMattersViz() {
  const [mode, setMode] = useState<'set' | 'sequence'>('set');
  const [key, setKey] = useState(0);

  const shuffled = useMemo(() => shuffleArray(ORIGINAL, 64399 + key * 7919), [key]);
  const sorted = useMemo(() => [...ORIGINAL].sort((a, b) => a - b), []);

  const regenerate = () => setKey(k => k + 1);

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Order Matters</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('set')}
            className={`px-3 py-1 text-xs rounded-md border ${
              mode === 'set' ? 'border-accent text-accent' : 'border-border text-text-secondary'
            }`}
          >
            Set Input
          </button>
          <button
            onClick={() => setMode('sequence')}
            className={`px-3 py-1 text-xs rounded-md border ${
              mode === 'sequence' ? 'border-green-500 text-green-500' : 'border-border text-text-secondary'
            }`}
          >
            Sequence Output
          </button>
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4 mb-4">
        {mode === 'set' ? (
          <div>
            <div className="text-xs text-text-secondary mb-3">
              Input: Unordered set (order shouldn't matter)
            </div>
            <div className="flex gap-2 justify-center mb-4">
              {shuffled.map((n, i) => (
                <motion.div
                  key={`${key}-${i}`}
                  className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-white font-bold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {n}
                </motion.div>
              ))}
            </div>
            <button
              onClick={regenerate}
              className="w-full py-2 text-xs rounded border border-border hover:border-accent"
            >
              Shuffle Input Order
            </button>
            <div className="text-xs text-text-secondary mt-3 text-center">
              Same set, different order → model should give same output
            </div>
          </div>
        ) : (
          <div>
            <div className="text-xs text-text-secondary mb-3">
              Output: Ordered sequence (order matters!)
            </div>
            <div className="flex gap-2 justify-center items-center">
              {sorted.map((n, i) => (
                <motion.div
                  key={i}
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold">
                    {n}
                  </div>
                  {i < sorted.length - 1 && (
                    <span className="mx-1 text-text-secondary">→</span>
                  )}
                </motion.div>
              ))}
            </div>
            <div className="text-xs text-text-secondary mt-3 text-center">
              Output must be in specific order (e.g., sorted)
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">Read-Process-Write</div>
          <div className="text-xs text-text-secondary">
            Read: Embed all inputs. Process: Attention over set. Write: Generate sequence.
          </div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">Permutation Invariance</div>
          <div className="text-xs text-text-secondary">
            Use attention to aggregate—order of input doesn't affect representation.
          </div>
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4">
        <div className="text-sm font-medium mb-2">Applications</div>
        <div className="text-xs text-text-secondary space-y-1">
          <div>• Sorting: Input set → sorted sequence</div>
          <div>• Convex hull: Points → ordered hull vertices</div>
          <div>• Sentence ordering: Shuffled sentences → coherent paragraph</div>
        </div>
      </div>
    </div>
  );
}
