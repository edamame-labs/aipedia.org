import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';
import { createRng } from '../../lib/rng';

const GRID_SIZE = 8;
const TOTAL_STEPS = 20;

function generateNoise(): number[][] {
  const random = createRng(44948);
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => random())
  );
}

function generateTarget(): number[][] {
  const grid: number[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => 0.1)
  );
  // Draw a simple pattern (circle-ish)
  const cx = GRID_SIZE / 2;
  const cy = GRID_SIZE / 2;
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const dist = Math.sqrt((i - cx) ** 2 + (j - cy) ** 2);
      if (dist < GRID_SIZE / 3) {
        grid[i][j] = 0.9;
      }
    }
  }
  return grid;
}

function interpolate(noise: number[][], target: number[][], t: number): number[][] {
  return noise.map((row, i) =>
    row.map((n, j) => n * (1 - t) + target[i][j] * t)
  );
}

export function DiffusionViz() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'reverse'>('reverse');
  const [noise] = useState(generateNoise);
  const [target] = useState(generateTarget);

  const t = direction === 'reverse' ? step / TOTAL_STEPS : 1 - step / TOTAL_STEPS;
  const grid = interpolate(noise, target, t);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setStep(s => {
        if (s >= TOTAL_STEPS) {
          setIsPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const reset = useCallback(() => {
    setStep(0);
    setIsPlaying(false);
  }, []);

  const cellSize = 32;

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Diffusion Process</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setDirection(d => (d === 'forward' ? 'reverse' : 'forward'))}
            className="px-3 py-1 text-xs rounded-md bg-bg border border-border hover:border-accent"
          >
            {direction === 'forward' ? '→ Noising' : '← Denoising'}
          </button>
        </div>
      </div>

      <p className="text-sm text-text-secondary mb-4">
        {direction === 'forward'
          ? 'Forward process: Gradually add noise to destroy structure.'
          : 'Reverse process: Learn to denoise step-by-step to generate images.'}
      </p>

      <div className="flex justify-center mb-4">
        <svg
          width={GRID_SIZE * cellSize}
          height={GRID_SIZE * cellSize}
          className="rounded-lg border border-border"
        >
          {grid.map((row, i) =>
            row.map((v, j) => (
              <motion.rect
                key={`${i}-${j}`}
                x={j * cellSize}
                y={i * cellSize}
                width={cellSize - 1}
                height={cellSize - 1}
                fill={`rgba(99,102,241,${v})`}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
              />
            ))
          )}
        </svg>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-text-secondary mb-1">
          <span>Step {step}/{TOTAL_STEPS}</span>
          <span>{direction === 'reverse' ? 'Noise → Image' : 'Image → Noise'}</span>
        </div>
        <div className="w-full bg-bg rounded-full h-2">
          <motion.div
            className="bg-accent h-2 rounded-full"
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 text-sm rounded-md bg-accent text-white hover:bg-accent/90"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 text-sm rounded-md bg-bg border border-border hover:border-accent"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 p-3 bg-bg rounded-lg border border-border">
        <p className="text-xs text-text-secondary">
          <span className="text-accent font-medium">Training:</span> Predict the noise ε at each step.
          <br />
          <span className="text-accent font-medium">Inference:</span> Start from pure noise, iteratively denoise.
        </p>
      </div>
    </div>
  );
}
