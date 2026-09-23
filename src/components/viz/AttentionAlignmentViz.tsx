import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';
import { createRng } from '../../lib/rng';

const SOURCE = ['Je', 'suis', 'étudiant', '.'];
const TARGET = ['I', 'am', 'a', 'student', '.'];

function generateAlignment(): number[][] {
  const random = createRng(87534);
  const alignment: number[][] = [];
  const patterns = [
    [0.8, 0.1, 0.05, 0.05],
    [0.1, 0.75, 0.1, 0.05],
    [0.05, 0.1, 0.1, 0.05],
    [0.05, 0.1, 0.8, 0.05],
    [0.05, 0.05, 0.1, 0.8],
  ];
  
  for (const pattern of patterns) {
    const row = pattern.map(v => v + (random() - 0.5) * 0.1);
    const sum = row.reduce((a, b) => a + b, 0);
    alignment.push(row.map(v => Math.max(0, v / sum)));
  }
  return alignment;
}

export function AttentionAlignmentViz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFormula, setShowFormula] = useState(false);
  
  const alignment = useMemo(() => generateAlignment(), []);
  
  const cellSize = 50;
  const maxStep = TARGET.length - 1;

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Attention Alignment</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-2 py-1 text-xs rounded border border-border disabled:opacity-30"
          >
            ←
          </button>
          <span className="text-xs text-text-secondary px-2 py-1">
            Step {currentStep + 1}/{TARGET.length}
          </span>
          <button
            onClick={() => setCurrentStep(Math.min(maxStep, currentStep + 1))}
            disabled={currentStep === maxStep}
            className="px-2 py-1 text-xs rounded border border-border disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <div>
          <div className="flex mb-1">
            <div style={{ width: 60 }} />
            {SOURCE.map((word, i) => (
              <motion.div
                key={i}
                style={{ width: cellSize }}
                className="text-xs text-center font-medium"
                animate={{
                  color: alignment[currentStep][i] > 0.3 ? 'rgb(99, 102, 241)' : 'rgb(156, 163, 175)',
                }}
              >
                {word}
              </motion.div>
            ))}
          </div>
          
          <div className="flex">
            <div className="flex flex-col">
              {TARGET.map((word, i) => (
                <div
                  key={i}
                  style={{ width: 60, height: cellSize }}
                  className={`flex items-center justify-end pr-2 text-xs ${
                    i === currentStep ? 'text-accent font-medium' : 'text-text-secondary'
                  }`}
                >
                  {word}
                </div>
              ))}
            </div>
            
            <svg
              width={SOURCE.length * cellSize}
              height={TARGET.length * cellSize}
              className="rounded-lg"
            >
              {TARGET.map((_, i) =>
                SOURCE.map((_, j) => {
                  const value = alignment[i][j];
                  const isCurrent = i === currentStep;
                  return (
                    <motion.rect
                      key={`${i}-${j}`}
                      x={j * cellSize + 2}
                      y={i * cellSize + 2}
                      width={cellSize - 4}
                      height={cellSize - 4}
                      rx={4}
                      fill={isCurrent ? `rgba(99, 102, 241, ${value})` : `rgba(107, 114, 128, ${value * 0.5})`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (i * SOURCE.length + j) * 0.02 }}
                    />
                  );
                })
              )}
            </svg>
          </div>
          
          <div className="text-xs text-text-secondary text-center mt-2">
            Source (French) → Target (English)
          </div>
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Current Output: "{TARGET[currentStep]}"</span>
          <button
            onClick={() => setShowFormula(!showFormula)}
            className="text-xs text-accent hover:underline"
          >
            {showFormula ? 'Hide math' : 'Show math'}
          </button>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {SOURCE.map((word, i) => {
            const weight = alignment[currentStep][i];
            return (
              <motion.div
                key={i}
                className="px-2 py-1 rounded text-xs"
                style={{
                  backgroundColor: `rgba(99, 102, 241, ${weight})`,
                  color: weight > 0.5 ? 'white' : 'inherit',
                }}
                animate={{ scale: weight > 0.3 ? 1.05 : 1 }}
              >
                {word}: {(weight * 100).toFixed(0)}%
              </motion.div>
            );
          })}
        </div>
        
        {showFormula && (
          <motion.div
            className="mt-3 p-2 bg-bg-secondary rounded text-xs font-mono"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <div className="text-text-secondary mb-1">Attention weights:</div>
            <div>α<sub>ij</sub> = softmax(e<sub>ij</sub>)</div>
            <div className="text-text-secondary mt-2 mb-1">Energy score:</div>
            <div>e<sub>ij</sub> = v<sup>T</sup> tanh(W<sub>s</sub>s<sub>i-1</sub> + W<sub>h</sub>h<sub>j</sub>)</div>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium text-green-500 mb-1">With Attention</div>
          <div className="text-xs text-text-secondary">
            Model learns which source words are relevant for each output word
          </div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium text-text-secondary mb-1">Without Attention</div>
          <div className="text-xs text-text-secondary">
            Entire source compressed into fixed-size vector—bottleneck
          </div>
        </div>
      </div>
    </div>
  );
}
