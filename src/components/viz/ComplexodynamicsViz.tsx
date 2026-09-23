import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';
import { createRng } from '../../lib/rng';

const GRID_SIZE = 20;

function generateGrid(t: number): number[][] {
  const random = createRng(54530 + t);
  const grid: number[][] = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    const row: number[] = [];
    for (let j = 0; j < GRID_SIZE; j++) {
      if (t === 0) {
        row.push(i < GRID_SIZE / 2 ? 1 : 0);
      } else if (t >= 100) {
        row.push(random() > 0.5 ? 1 : 0);
      } else {
        const noise = Math.sin(i * 0.5 + t * 0.1) * Math.cos(j * 0.3 + t * 0.05);
        const structure = (i + j + t) % (Math.max(2, 20 - t / 5)) < (10 - t / 10) ? 1 : 0;
        row.push(noise > 0 ? structure : 1 - structure);
      }
    }
    grid.push(row);
  }
  return grid;
}

function calculateComplexity(grid: number[][]): number {
  let transitions = 0;
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE - 1; j++) {
      if (grid[i][j] !== grid[i][j + 1]) transitions++;
    }
  }
  for (let i = 0; i < GRID_SIZE - 1; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j] !== grid[i + 1][j]) transitions++;
    }
  }
  const maxTransitions = 2 * GRID_SIZE * (GRID_SIZE - 1);
  const normalized = transitions / maxTransitions;
  return 4 * normalized * (1 - normalized);
}

function calculateEntropy(grid: number[][]): number {
  let ones = 0;
  const total = GRID_SIZE * GRID_SIZE;
  for (const row of grid) {
    for (const cell of row) {
      ones += cell;
    }
  }
  const p = ones / total;
  if (p === 0 || p === 1) return 0;
  return -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
}

export function ComplexodynamicsViz() {
  const [time, setTime] = useState(0);

  const grid = useMemo(() => generateGrid(time), [time]);
  const complexity = calculateComplexity(grid);
  const entropy = calculateEntropy(grid);

  const cellSize = 12;

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Complexodynamics</h3>
        <span className="text-xs text-text-secondary">t = {time}</span>
      </div>

      <div className="mb-4">
        <input
          type="range"
          min="0"
          max="100"
          value={time}
          onChange={(e) => setTime(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-text-secondary mt-1">
          <span>Low Entropy (Ordered)</span>
          <span>High Entropy (Random)</span>
        </div>
      </div>

      <div className="flex gap-6 justify-center mb-6">
        <div className="bg-bg rounded-lg border border-border p-2">
          <svg width={GRID_SIZE * cellSize} height={GRID_SIZE * cellSize}>
            {grid.map((row, i) =>
              row.map((cell, j) => (
                <motion.rect
                  key={`${i}-${j}`}
                  x={j * cellSize}
                  y={i * cellSize}
                  width={cellSize - 1}
                  height={cellSize - 1}
                  fill={cell ? 'rgb(99, 102, 241)' : 'rgb(30, 30, 46)'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: (i + j) * 0.002 }}
                />
              ))
            )}
          </svg>
        </div>

        <div className="flex flex-col gap-4">
          <div className="p-3 bg-bg rounded-lg border border-border">
            <div className="text-xs text-text-secondary mb-1">Entropy</div>
            <div className="w-32 h-4 bg-bg-secondary rounded overflow-hidden">
              <motion.div
                className="h-full bg-orange-500"
                animate={{ width: `${entropy * 100}%` }}
              />
            </div>
            <div className="text-sm font-mono mt-1">{entropy.toFixed(3)}</div>
          </div>
          
          <div className="p-3 bg-bg rounded-lg border border-border">
            <div className="text-xs text-text-secondary mb-1">Complexity</div>
            <div className="w-32 h-4 bg-bg-secondary rounded overflow-hidden">
              <motion.div
                className="h-full bg-accent"
                animate={{ width: `${complexity * 100}%` }}
              />
            </div>
            <div className="text-sm font-mono mt-1">{complexity.toFixed(3)}</div>
          </div>
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4">
        <div className="text-sm font-medium mb-2">The Key Insight</div>
        <div className="text-xs text-text-secondary">
          Entropy increases monotonically. Complexity peaks at intermediate times—
          neither fully ordered nor fully random states are complex.
        </div>
      </div>
    </div>
  );
}
