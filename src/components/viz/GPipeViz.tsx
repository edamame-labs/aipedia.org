import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

const NUM_DEVICES = 4;
const NUM_MICROBATCHES = 8;

type CellState = 'idle' | 'forward' | 'backward' | 'bubble';

export function GPipeViz() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const maxSteps = NUM_DEVICES + NUM_MICROBATCHES * 2;

  useEffect(() => {
    if (isPlaying && step < maxSteps) {
      const timer = setTimeout(() => setStep(s => s + 1), 400);
      return () => clearTimeout(timer);
    } else if (step >= maxSteps) {
      setIsPlaying(false);
    }
  }, [isPlaying, step, maxSteps]);

  const getCellState = (device: number, microbatch: number): CellState => {
    const fwdStart = microbatch + device;
    const fwdEnd = fwdStart + 1;
    const bwdStart = NUM_MICROBATCHES + (NUM_DEVICES - 1 - device) + microbatch;
    const bwdEnd = bwdStart + 1;

    if (step >= fwdStart && step < fwdEnd) return 'forward';
    if (step >= bwdStart && step < bwdEnd) return 'backward';
    if (step >= fwdEnd && step < bwdStart) return 'bubble';
    return 'idle';
  };

  const getColor = (state: CellState): string => {
    switch (state) {
      case 'forward': return 'rgb(99, 102, 241)';
      case 'backward': return 'rgb(34, 197, 94)';
      case 'bubble': return 'rgb(75, 85, 99)';
      default: return 'rgb(55, 65, 81)';
    }
  };

  const cellWidth = 32;
  const cellHeight = 28;

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">GPipe Pipeline Parallelism</h3>
        <div className="flex gap-2">
          <button
            onClick={() => { setStep(0); setIsPlaying(true); }}
            className="px-3 py-1 text-xs rounded-md border border-accent text-accent hover:bg-accent/10"
          >
            {isPlaying ? 'Playing...' : 'Play'}
          </button>
          <button
            onClick={() => setStep(0)}
            className="px-3 py-1 text-xs rounded-md border border-border hover:border-accent"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4 mb-4 overflow-x-auto">
        <div className="flex mb-2">
          <div className="w-20 text-xs text-text-secondary">Device</div>
          <div className="flex">
            {Array.from({ length: maxSteps }).map((_, t) => (
              <div
                key={t}
                style={{ width: cellWidth }}
                className={`text-xs text-center ${t === step ? 'text-accent font-bold' : 'text-text-secondary'}`}
              >
                {t}
              </div>
            ))}
          </div>
        </div>

        {Array.from({ length: NUM_DEVICES }).map((_, device) => (
          <div key={device} className="flex items-center mb-1">
            <div className="w-20 text-xs text-text-secondary">GPU {device}</div>
            <div className="flex">
              {Array.from({ length: maxSteps }).map((_, t) => {
                const microbatchAtTime = Array.from({ length: NUM_MICROBATCHES }, (_, i) => i).find(mb => {
                  const fwdStart = mb + device;
                  const bwdStart = NUM_MICROBATCHES + (NUM_DEVICES - 1 - device) + mb;
                  return t === fwdStart || t === bwdStart;
                });

                const state = microbatchAtTime !== undefined
                  ? getCellState(device, microbatchAtTime)
                  : 'idle' as CellState;

                return (
                  <motion.div
                    key={t}
                    style={{
                      width: cellWidth - 2,
                      height: cellHeight,
                      backgroundColor: getColor(state),
                    }}
                    className="rounded-sm mx-px flex items-center justify-center text-xs text-white"
                    animate={{
                      scale: t === step && state !== 'idle' ? 1.1 : 1,
                    }}
                  >
                    {microbatchAtTime !== undefined && state !== 'idle' && state !== 'bubble' && (
                      <span>{microbatchAtTime}</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(99, 102, 241)' }} />
          <span className="text-xs text-text-secondary">Forward</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(34, 197, 94)' }} />
          <span className="text-xs text-text-secondary">Backward</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(75, 85, 99)' }} />
          <span className="text-xs text-text-secondary">Bubble (idle)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">Micro-batch Splitting</div>
          <div className="text-xs text-text-secondary">
            Split batch into M micro-batches. Pipeline them across devices to hide latency.
          </div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">Bubble Overhead</div>
          <div className="text-xs text-text-secondary">
            Bubbles = (K-1)/M of total time. More micro-batches → less overhead.
          </div>
        </div>
      </div>
    </div>
  );
}
