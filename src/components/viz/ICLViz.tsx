import { useState } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

const EXAMPLES = [
  { input: 'The movie was terrible', output: 'negative' },
  { input: 'I loved every minute', output: 'positive' },
  { input: 'A complete masterpiece', output: 'positive' },
  { input: 'Waste of time', output: 'negative' },
];

const TEST_INPUT = 'The acting was brilliant';
const PREDICTIONS = {
  0: { positive: 0.52, negative: 0.48 },
  1: { positive: 0.68, negative: 0.32 },
  2: { positive: 0.81, negative: 0.19 },
  3: { positive: 0.89, negative: 0.11 },
  4: { positive: 0.94, negative: 0.06 },
};

export function ICLViz() {
  const [numExamples, setNumExamples] = useState(2);

  const prediction = PREDICTIONS[numExamples as keyof typeof PREDICTIONS];
  const predictedLabel = prediction.positive > prediction.negative ? 'positive' : 'negative';

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">In-Context Learning Demo</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Examples:</span>
          <input
            type="range"
            min="0"
            max="4"
            value={numExamples}
            onChange={e => setNumExamples(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-sm font-mono w-4">{numExamples}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-xs text-text-secondary">Prompt:</div>
        <div className="p-3 bg-bg rounded-lg border border-border font-mono text-sm space-y-1">
          {numExamples === 0 && (
            <div className="text-text-secondary italic">No examples (zero-shot)</div>
          )}
          {EXAMPLES.slice(0, numExamples).map((ex, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="text-text-secondary">Input:</span> "{ex.input}" →{' '}
              <span className="text-accent">{ex.output}</span>
            </motion.div>
          ))}
          <div className="pt-2 border-t border-border mt-2">
            <span className="text-text-secondary">Input:</span> "{TEST_INPUT}" →{' '}
            <span className="text-green-500 font-medium">?</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-xs text-text-secondary mb-2">Model Prediction</div>
          <div className="flex items-center gap-2">
            <motion.span
              className={`text-lg font-medium ${
                predictedLabel === 'positive' ? 'text-green-500' : 'text-red-400'
              }`}
              key={numExamples}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              {predictedLabel}
            </motion.span>
            <span className="text-xs text-text-secondary">
              ({(Math.max(prediction.positive, prediction.negative) * 100).toFixed(0)}% confidence)
            </span>
          </div>
        </div>

        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-xs text-text-secondary mb-2">Probability Distribution</div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>positive</span>
                <span>{(prediction.positive * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-bg-secondary rounded-full h-2">
                <motion.div
                  className="bg-green-500 h-2 rounded-full"
                  animate={{ width: `${prediction.positive * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>negative</span>
                <span>{(prediction.negative * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-bg-secondary rounded-full h-2">
                <motion.div
                  className="bg-red-400 h-2 rounded-full"
                  animate={{ width: `${prediction.negative * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-bg rounded-lg border border-border">
        <p className="text-xs text-text-secondary">
          <span className="text-accent font-medium">Observation:</span> More examples →
          higher confidence. The model "learns" the sentiment task from context alone.
        </p>
      </div>
    </div>
  );
}
