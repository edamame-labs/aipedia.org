import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../lib/motion';
import { createRng } from '../../lib/rng';

const TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat', '.', '[END]'];
const NUM_HEADS = 4;

function generateMultiHeadAttention(size: number, heads: number) {
  const random = createRng(2984);
  return Array.from({ length: heads }, () => {
    const matrix: number[][] = [];
    for (let i = 0; i < size; i++) {
      const row: number[] = [];
      let sum = 0;
      for (let j = 0; j < size; j++) {
        const v = random();
        row.push(v);
        sum += v;
      }
      matrix.push(row.map(v => v / sum));
    }
    return matrix;
  });
}

export function TransformerViz() {
  const [head, setHead] = useState(0);
  const [step, setStep] = useState(0);
  const [hovered, setHovered] = useState<{ i: number; j: number } | null>(null);

  const attention = useMemo(() => generateMultiHeadAttention(TOKENS.length, NUM_HEADS), []);
  const matrix = attention[head];

  const maxVal = useMemo(() => Math.max(...matrix.flat()), [matrix]);

  const cellSize = 56;
  const labelWidth = 72;

  const nextStep = useCallback(() => setStep(s => (s + 1) % 3), []);

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Multi-Head Self-Attention</h3>
        <button
          onClick={nextStep}
          className="px-3 py-1 text-xs rounded-md bg-bg border border-border hover:border-accent"
        >
          Step: {['QKᵀ', 'Softmax', 'Weighted Sum'][step]}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {Array.from({ length: NUM_HEADS }).map((_, i) => (
          <button
            key={i}
            onClick={() => setHead(i)}
            className={`px-3 py-1 text-xs rounded-md border ${
              head === i ? 'border-accent text-accent' : 'border-border text-text-secondary'
            }`}
          >
            Head {i + 1}
          </button>
        ))}
      </div>

      <div className="flex">
        <div style={{ width: labelWidth }} />
        {TOKENS.map(t => (
          <div key={t} style={{ width: cellSize }} className="text-xs text-center text-text-secondary truncate">
            {t}
          </div>
        ))}
      </div>

      <div className="flex">
        <div className="flex flex-col">
          {TOKENS.map(t => (
            <div
              key={t}
              style={{ width: labelWidth, height: cellSize }}
              className="flex items-center justify-end pr-2 text-xs text-text-secondary"
            >
              {t}
            </div>
          ))}
        </div>

        <svg
          width={TOKENS.length * cellSize}
          height={TOKENS.length * cellSize}
          className="rounded-lg"
        >
          {matrix.map((row, i) =>
            row.map((v, j) => {
              const active = hovered?.i === i || hovered?.j === j;
              return (
                <motion.rect
                  key={`${i}-${j}`}
                  x={j * cellSize}
                  y={i * cellSize}
                  width={cellSize - 2}
                  height={cellSize - 2}
                  rx={6}
                  fill={`rgba(99,102,241,${v / maxVal})`}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: step === 0 ? 0.4 : active ? 1 : 0.7,
                    scale: hovered?.i === i && hovered?.j === j ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.25 }}
                  onMouseEnter={() => setHovered({ i, j })}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })
          )}
        </svg>
      </div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-4 p-3 bg-bg rounded-lg border border-border text-sm"
          >
            <span className="font-medium text-accent">{TOKENS[hovered.i]}</span>
            <span className="text-text-secondary"> → </span>
            <span className="font-medium text-accent">{TOKENS[hovered.j]}</span>
            <span className="text-text-secondary"> attention: </span>
            <span className="font-mono">{matrix[hovered.i][hovered.j].toFixed(3)}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6">
        <h4 className="text-sm font-medium mb-2">Positional Encoding</h4>
        <div className="flex gap-1">
          {TOKENS.map((_, i) => (
            <motion.div
              key={i}
              className="h-2 w-6 rounded-sm bg-accent"
              initial={{ opacity: 0.2 }}
              animate={{ opacity: 0.2 + (i / TOKENS.length) }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
