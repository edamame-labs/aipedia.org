import { useState } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

const GRID_SIZE = 9;
const CELL_SIZE = 28;

function getReceptiveField(dilation: number): boolean[][] {
  const grid = Array.from({ length: GRID_SIZE }, () => 
    Array.from({ length: GRID_SIZE }, () => false)
  );
  const center = Math.floor(GRID_SIZE / 2);
  
  for (let di = -1; di <= 1; di++) {
    for (let dj = -1; dj <= 1; dj++) {
      const i = center + di * dilation;
      const j = center + dj * dilation;
      if (i >= 0 && i < GRID_SIZE && j >= 0 && j < GRID_SIZE) {
        grid[i][j] = true;
      }
    }
  }
  return grid;
}

function getCumulativeReceptiveField(dilations: number[]): boolean[][] {
  const grid = Array.from({ length: GRID_SIZE }, () => 
    Array.from({ length: GRID_SIZE }, () => false)
  );
  const center = Math.floor(GRID_SIZE / 2);
  
  let currentSize = 1;
  for (const d of dilations) {
    const offset = Math.floor(currentSize / 2);
    for (let ci = -offset; ci <= offset; ci++) {
      for (let cj = -offset; cj <= offset; cj++) {
        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            const i = center + ci + di * d;
            const j = center + cj + dj * d;
            if (i >= 0 && i < GRID_SIZE && j >= 0 && j < GRID_SIZE) {
              grid[i][j] = true;
            }
          }
        }
      }
    }
    currentSize = currentSize + 2 * d;
  }
  return grid;
}

export function DilatedConvViz() {
  const [dilation, setDilation] = useState(1);
  const [showCumulative, setShowCumulative] = useState(false);
  
  const dilationSequence = [1, 2, 4];
  const singleField = getReceptiveField(dilation);
  const cumulativeField = getCumulativeReceptiveField(dilationSequence.slice(0, dilationSequence.indexOf(dilation) + 1));
  const field = showCumulative ? cumulativeField : singleField;

  const receptiveSize = showCumulative
    ? 1 + 2 * dilationSequence.slice(0, dilationSequence.indexOf(dilation) + 1).reduce((a, b) => a + b, 0)
    : 1 + 2 * dilation;

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Dilated Convolutions</h3>
        <button
          onClick={() => setShowCumulative(!showCumulative)}
          className={`px-3 py-1 text-xs rounded-md border ${
            showCumulative ? 'border-accent text-accent' : 'border-border text-text-secondary'
          }`}
        >
          {showCumulative ? 'Cumulative' : 'Single Layer'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 justify-center">
        {dilationSequence.map((d) => (
          <button
            key={d}
            onClick={() => setDilation(d)}
            className={`px-4 py-2 text-sm rounded-md border ${
              dilation === d ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-secondary'
            }`}
          >
            d = {d}
          </button>
        ))}
      </div>

      <div className="flex justify-center mb-6">
        <div className="relative">
          <svg
            width={GRID_SIZE * CELL_SIZE}
            height={GRID_SIZE * CELL_SIZE}
            className="rounded-lg bg-bg"
          >
            {field.map((row, i) =>
              row.map((active, j) => (
                <motion.rect
                  key={`${i}-${j}`}
                  x={j * CELL_SIZE + 2}
                  y={i * CELL_SIZE + 2}
                  width={CELL_SIZE - 4}
                  height={CELL_SIZE - 4}
                  rx={4}
                  fill={active ? 'rgb(99, 102, 241)' : 'rgb(55, 65, 81)'}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: active ? 1 : 0.3,
                    scale: 1
                  }}
                  transition={{ delay: (i * GRID_SIZE + j) * 0.01 }}
                />
              ))
            )}
            <rect
              x={Math.floor(GRID_SIZE / 2) * CELL_SIZE + 2}
              y={Math.floor(GRID_SIZE / 2) * CELL_SIZE + 2}
              width={CELL_SIZE - 4}
              height={CELL_SIZE - 4}
              rx={4}
              fill="rgb(249, 115, 22)"
              stroke="white"
              strokeWidth={2}
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-bg rounded-lg border border-border text-center">
          <div className="text-2xl font-bold text-accent">{receptiveSize}×{receptiveSize}</div>
          <div className="text-xs text-text-secondary">Receptive Field</div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border text-center">
          <div className="text-2xl font-bold text-accent">9</div>
          <div className="text-xs text-text-secondary">Parameters (3×3)</div>
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4">
        <div className="text-sm font-medium mb-2">Why Dilated Convolutions?</div>
        <div className="space-y-2 text-xs text-text-secondary">
          <div className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Exponentially growing receptive field without pooling</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Preserves spatial resolution for dense prediction</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Same number of parameters as standard convolution</span>
          </div>
        </div>
        
        <div className="mt-3 font-mono text-xs bg-bg-secondary p-2 rounded">
          <span className="text-text-secondary">Receptive field after L layers:</span>{' '}
          <span className="text-accent">(2^(L+1) - 1) × (2^(L+1) - 1)</span>
        </div>
      </div>
    </div>
  );
}
