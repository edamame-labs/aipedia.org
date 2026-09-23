import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';
import { createRng } from '../../lib/rng';

const BATCH_SIZE = 4;
const FEATURES = 6;

function generateData(): number[][] {
  const random = createRng(82598);
  return Array.from({ length: BATCH_SIZE }, () =>
    Array.from({ length: FEATURES }, () => random() * 4 - 1)
  );
}

export function LayerNormViz() {
  const [mode, setMode] = useState<'batch' | 'layer'>('layer');
  const [data] = useState(generateData);

  const normalized = useMemo(() => {
    if (mode === 'batch') {
      // Normalize across batch (column-wise)
      const means = Array.from({ length: FEATURES }, (_, f) =>
        data.reduce((sum, row) => sum + row[f], 0) / BATCH_SIZE
      );
      const stds = Array.from({ length: FEATURES }, (_, f) => {
        const variance = data.reduce((sum, row) => sum + (row[f] - means[f]) ** 2, 0) / BATCH_SIZE;
        return Math.sqrt(variance + 1e-5);
      });
      return data.map(row => row.map((v, f) => (v - means[f]) / stds[f]));
    } else {
      // Normalize across features (row-wise)
      return data.map(row => {
        const mean = row.reduce((a, b) => a + b, 0) / FEATURES;
        const variance = row.reduce((a, b) => a + (b - mean) ** 2, 0) / FEATURES;
        const std = Math.sqrt(variance + 1e-5);
        return row.map(v => (v - mean) / std);
      });
    }
  }, [data, mode]);

  const cellSize = 36;
  const gap = 2;

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Normalization Comparison</h3>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('batch')}
          className={`px-3 py-1 text-xs rounded-md border ${
            mode === 'batch' ? 'border-red-400 text-red-400' : 'border-border text-text-secondary'
          }`}
        >
          BatchNorm (↓ columns)
        </button>
        <button
          onClick={() => setMode('layer')}
          className={`px-3 py-1 text-xs rounded-md border ${
            mode === 'layer' ? 'border-green-500 text-green-500' : 'border-border text-text-secondary'
          }`}
        >
          LayerNorm (→ rows)
        </button>
      </div>

      <div className="flex gap-8 justify-center">
        <div>
          <div className="text-xs text-text-secondary mb-2 text-center">Original</div>
          <div className="grid" style={{ gridTemplateColumns: `repeat(${FEATURES}, ${cellSize}px)`, gap }}>
            {data.flat().map((v, i) => (
              <div
                key={i}
                className="flex items-center justify-center text-xs font-mono rounded"
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: `rgba(99,102,241,${Math.abs(v) / 3})`,
                }}
              >
                {v.toFixed(1)}
              </div>
            ))}
          </div>
          <div className="flex mt-1">
            <div className="text-xs text-text-secondary" style={{ width: cellSize * FEATURES }}>
              ← {FEATURES} features →
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-text-secondary mb-2 text-center">Normalized</div>
          <div className="grid" style={{ gridTemplateColumns: `repeat(${FEATURES}, ${cellSize}px)`, gap }}>
            {normalized.flat().map((v, i) => {
              const row = Math.floor(i / FEATURES);
              const col = i % FEATURES;
              const highlight = mode === 'batch' ? col : row;
              return (
                <motion.div
                  key={i}
                  className="flex items-center justify-center text-xs font-mono rounded"
                  style={{
                    width: cellSize,
                    height: cellSize,
                    background: mode === 'layer'
                      ? `rgba(34,197,94,${Math.abs(v) / 2})`
                      : `rgba(239,68,68,${Math.abs(v) / 2})`,
                  }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {v.toFixed(1)}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-bg rounded-lg border border-border">
        <p className="text-xs text-text-secondary">
          <span className={mode === 'layer' ? 'text-green-500' : 'text-red-400'} style={{ fontWeight: 500 }}>
            {mode === 'layer' ? 'LayerNorm' : 'BatchNorm'}:
          </span>{' '}
          {mode === 'layer'
            ? 'Each row (sample) is normalized independently. μ≈0, σ²≈1 per row.'
            : 'Each column (feature) is normalized across the batch. μ≈0, σ²≈1 per column.'}
        </p>
      </div>
    </div>
  );
}
