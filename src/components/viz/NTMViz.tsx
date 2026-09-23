import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';
import { createRng } from '../../lib/rng';

const MEMORY_SIZE = 8;
const MEMORY_WIDTH = 6;

function generateMemory(): number[][] {
  const random = createRng(70311);
  return Array.from({ length: MEMORY_SIZE }, () =>
    Array.from({ length: MEMORY_WIDTH }, () => random())
  );
}

function generateWeights(seed: number): number[] {
  const random = createRng(seed);
  const weights = Array.from({ length: MEMORY_SIZE }, () => random());
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map(w => w / sum);
}

export function NTMViz() {
  const [operation, setOperation] = useState<'read' | 'write'>('read');
  const [step, setStep] = useState(0);

  const memory = useMemo(() => generateMemory(), []);
  const readWeights = useMemo(() => generateWeights(24007), []);
  const writeWeights = useMemo(() => generateWeights(61553), []);

  const weights = operation === 'read' ? readWeights : writeWeights;
  const focusedRow = weights.indexOf(Math.max(...weights));

  const nextStep = () => setStep((s) => (s + 1) % 4);

  const stepLabels = ['Content Addressing', 'Interpolation', 'Shift', 'Sharpen'];

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Neural Turing Machine</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setOperation('read')}
            className={`px-3 py-1 text-xs rounded-md border ${
              operation === 'read' ? 'border-green-500 text-green-500' : 'border-border text-text-secondary'
            }`}
          >
            Read
          </button>
          <button
            onClick={() => setOperation('write')}
            className={`px-3 py-1 text-xs rounded-md border ${
              operation === 'write' ? 'border-orange-500 text-orange-500' : 'border-border text-text-secondary'
            }`}
          >
            Write
          </button>
        </div>
      </div>

      <div className="flex gap-8 justify-center mb-6">
        <div>
          <div className="text-xs text-text-secondary mb-2 text-center">Memory Bank</div>
          <div className="bg-bg rounded-lg border border-border p-2">
            {memory.map((row, i) => (
              <div key={i} className="flex gap-1 mb-1">
                {row.map((val, j) => (
                  <motion.div
                    key={j}
                    className="w-6 h-6 rounded text-xs flex items-center justify-center"
                    style={{
                      backgroundColor: `rgba(99, 102, 241, ${val})`,
                    }}
                    animate={{
                      scale: i === focusedRow ? 1.1 : 1,
                      borderWidth: i === focusedRow ? 2 : 0,
                      borderColor: operation === 'read' ? 'rgb(34, 197, 94)' : 'rgb(249, 115, 22)',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs text-text-secondary mb-2 text-center">Attention Weights</div>
          <div className="bg-bg rounded-lg border border-border p-2">
            {weights.map((w, i) => (
              <motion.div
                key={i}
                className="h-6 mb-1 rounded flex items-center px-2"
                style={{
                  width: `${Math.max(20, w * 100)}px`,
                  backgroundColor: operation === 'read' ? 'rgb(34, 197, 94)' : 'rgb(249, 115, 22)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(20, w * 100)}px` }}
              >
                <span className="text-xs text-white">{(w * 100).toFixed(0)}%</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Addressing Pipeline</span>
          <button
            onClick={nextStep}
            className="px-2 py-1 text-xs rounded border border-border hover:border-accent"
          >
            Step: {stepLabels[step]}
          </button>
        </div>
        <div className="flex gap-2">
          {stepLabels.map((label, i) => (
            <motion.div
              key={i}
              className={`flex-1 p-2 rounded text-xs text-center ${
                i === step ? 'bg-accent text-white' : 'bg-bg-secondary text-text-secondary'
              }`}
              animate={{ scale: i === step ? 1.05 : 1 }}
            >
              {label}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium text-green-500 mb-1">Read Head</div>
          <div className="text-xs text-text-secondary">
            Retrieves weighted sum of memory rows based on content similarity
          </div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium text-orange-500 mb-1">Write Head</div>
          <div className="text-xs text-text-secondary">
            Erases then adds to memory locations based on attention weights
          </div>
        </div>
      </div>
    </div>
  );
}
