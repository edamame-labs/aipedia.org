import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../lib/motion';

const PROBLEM = "A store has 23 apples. If 8 are sold in the morning and 12 more arrive in the afternoon, how many apples are there?";

const STANDARD_ANSWER = { answer: '27', correct: true };
const COT_STEPS = [
  { step: 'Start with 23 apples', value: 23 },
  { step: 'Sold 8 in morning: 23 - 8 = 15', value: 15 },
  { step: 'Added 12 in afternoon: 15 + 12 = 27', value: 27 },
];

export function CoTViz() {
  const [mode, setMode] = useState<'standard' | 'cot'>('standard');
  const [showSteps, setShowSteps] = useState(false);

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Chain-of-Thought Demo</h3>
        <div className="flex gap-2">
          <button
            onClick={() => { setMode('standard'); setShowSteps(false); }}
            className={`px-3 py-1 text-xs rounded-md border ${
              mode === 'standard' ? 'border-accent text-accent' : 'border-border text-text-secondary'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => { setMode('cot'); setShowSteps(false); }}
            className={`px-3 py-1 text-xs rounded-md border ${
              mode === 'cot' ? 'border-accent text-accent' : 'border-border text-text-secondary'
            }`}
          >
            Chain-of-Thought
          </button>
        </div>
      </div>

      <div className="p-3 bg-bg rounded-lg border border-border mb-4">
        <div className="text-xs text-text-secondary mb-1">Problem:</div>
        <p className="text-sm">{PROBLEM}</p>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'standard' ? (
          <motion.div
            key="standard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-bg rounded-lg border border-border"
          >
            <div className="text-xs text-text-secondary mb-2">Standard Prompting:</div>
            <div className="font-mono text-sm">
              <span className="text-text-secondary">Q:</span> {PROBLEM}<br />
              <span className="text-text-secondary">A:</span>{' '}
              <span className="text-green-500 font-medium">{STANDARD_ANSWER.answer}</span>
            </div>
            <div className="mt-3 text-xs text-text-secondary">
              Model jumps directly to answer (may be correct, may not be for harder problems)
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="cot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-bg rounded-lg border border-border"
          >
            <div className="text-xs text-text-secondary mb-2">Chain-of-Thought Prompting:</div>
            <div className="font-mono text-sm">
              <span className="text-text-secondary">Q:</span> {PROBLEM}<br />
              <span className="text-text-secondary">A:</span> Let's think step by step.
            </div>
            
            <button
              onClick={() => setShowSteps(true)}
              className="mt-3 px-3 py-1 text-xs rounded border border-accent text-accent hover:bg-accent/10"
              disabled={showSteps}
            >
              {showSteps ? 'Reasoning...' : 'Generate Reasoning'}
            </button>

            {showSteps && (
              <div className="mt-3 space-y-2">
                {COT_STEPS.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.5 }}
                    className="flex items-center gap-3 p-2 bg-bg-secondary rounded"
                  >
                    <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm">{step.step}</span>
                    <span className="ml-auto font-mono text-accent">{step.value}</span>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: COT_STEPS.length * 0.5 }}
                  className="pt-2 border-t border-border"
                >
                  <span className="text-text-secondary">Final answer:</span>{' '}
                  <span className="text-green-500 font-medium text-lg">27 apples</span>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-2xl font-bold text-text-secondary">18%</div>
          <div className="text-xs text-text-secondary">Standard (GSM8K)</div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-2xl font-bold text-green-500">57%</div>
          <div className="text-xs text-text-secondary">Chain-of-Thought</div>
        </div>
      </div>
    </div>
  );
}
