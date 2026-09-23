import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';
const SIZE = 30;

function initializeGrid(): boolean[][] {
  const grid: boolean[][] = [];
  for (let i = 0; i < SIZE; i++) {
    const row: boolean[] = [];
    for (let j = 0; j < SIZE; j++) {
      row.push(i < SIZE / 2);
    }
    grid.push(row);
  }
  return grid;
}

function evolveGrid(grid: boolean[][]): boolean[][] {
  const newGrid: boolean[][] = [];
  for (let i = 0; i < SIZE; i++) {
    const row: boolean[] = [];
    for (let j = 0; j < SIZE; j++) {
      const neighbors = [
        grid[(i - 1 + SIZE) % SIZE]?.[j],
        grid[(i + 1) % SIZE]?.[j],
        grid[i]?.[(j - 1 + SIZE) % SIZE],
        grid[i]?.[(j + 1) % SIZE],
      ].filter(Boolean).length;
      
      if (grid[i][j]) {
        row.push(neighbors >= 1 && neighbors <= 3 && Math.random() > 0.1);
      } else {
        row.push(neighbors >= 2 && neighbors <= 3 && Math.random() > 0.2);
      }
    }
    newGrid.push(row);
  }
  return newGrid;
}

function calculateMetrics(grid: boolean[][]) {
  let ones = 0;
  let transitions = 0;
  
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (grid[i][j]) ones++;
      if (j < SIZE - 1 && grid[i][j] !== grid[i][j + 1]) transitions++;
      if (i < SIZE - 1 && grid[i][j] !== grid[i + 1][j]) transitions++;
    }
  }
  
  const p = ones / (SIZE * SIZE);
  const entropy = p > 0 && p < 1 ? -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p)) : 0;
  const maxTrans = 2 * SIZE * (SIZE - 1);
  const complexity = 4 * (transitions / maxTrans) * (1 - transitions / maxTrans);
  
  return { entropy, complexity };
}

export function CoffeeAutomatonViz() {
  const [grid, setGrid] = useState(initializeGrid);
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);

  const metrics = useMemo(() => calculateMetrics(grid), [grid]);

  useEffect(() => {
    if (isRunning) {
      const timer = setInterval(() => {
        setGrid(g => evolveGrid(g));
        setStep(s => s + 1);
      }, 200);
      return () => clearInterval(timer);
    }
  }, [isRunning]);

  const reset = () => {
    setGrid(initializeGrid());
    setStep(0);
    setIsRunning(false);
  };

  const cellSize = 8;

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Coffee Automaton</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1 text-xs rounded-md border ${
              isRunning ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'
            }`}
          >
            {isRunning ? 'Pause' : 'Run'}
          </button>
          <button
            onClick={reset}
            className="px-3 py-1 text-xs rounded-md border border-border hover:border-accent"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex gap-6 justify-center mb-4">
        <div className="bg-bg rounded-lg border border-border p-2">
          <svg width={SIZE * cellSize} height={SIZE * cellSize}>
            {grid.map((row, i) =>
              row.map((cell, j) => (
                <rect
                  key={`${i}-${j}`}
                  x={j * cellSize}
                  y={i * cellSize}
                  width={cellSize - 1}
                  height={cellSize - 1}
                  fill={cell ? 'rgb(139, 69, 19)' : 'rgb(255, 248, 220)'}
                />
              ))
            )}
          </svg>
        </div>

        <div className="flex flex-col gap-4">
          <div className="p-3 bg-bg rounded-lg border border-border">
            <div className="text-xs text-text-secondary mb-1">Step</div>
            <div className="text-xl font-bold text-accent">{step}</div>
          </div>
          <div className="p-3 bg-bg rounded-lg border border-border">
            <div className="text-xs text-text-secondary mb-1">Entropy</div>
            <div className="w-24 h-3 bg-bg-secondary rounded overflow-hidden">
              <motion.div
                className="h-full bg-orange-500"
                animate={{ width: `${metrics.entropy * 100}%` }}
              />
            </div>
          </div>
          <div className="p-3 bg-bg rounded-lg border border-border">
            <div className="text-xs text-text-secondary mb-1">Complexity</div>
            <div className="w-24 h-3 bg-bg-secondary rounded overflow-hidden">
              <motion.div
                className="h-full bg-accent"
                animate={{ width: `${metrics.complexity * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4">
        <div className="text-sm font-medium mb-2">The Coffee Metaphor</div>
        <div className="text-xs text-text-secondary">
          Like cream mixing into coffee: starts ordered (separated), becomes complex
          (swirling patterns), ends disordered (uniform). Complexity peaks in the middle.
        </div>
      </div>
    </div>
  );
}
