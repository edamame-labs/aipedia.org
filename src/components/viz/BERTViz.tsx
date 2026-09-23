import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../lib/motion';
import { createRng } from '../../lib/rng';

const SENTENCE = ['The', 'cat', 'sat', 'on', 'the', '[MASK]', '.'];
const PREDICTIONS = ['mat', 'floor', 'ground', 'rug', 'bed'];
const PROBABILITIES = [0.42, 0.23, 0.18, 0.11, 0.06];

export function BERTViz() {
  const [step, setStep] = useState<'input' | 'attention' | 'predict'>('input');
  const [hoveredToken, setHoveredToken] = useState<number | null>(null);
  const [showPredictions, setShowPredictions] = useState(false);

  const maskIndex = SENTENCE.indexOf('[MASK]');

  const attentionWeights = useMemo(() => {
    const random = createRng(88014);
    return SENTENCE.map((_, i) => {
      if (i === maskIndex) return SENTENCE.map(() => 0.14);
      const weights = SENTENCE.map((_, j) => {
        if (j === maskIndex) return 0.3;
        return 0.1 + random() * 0.1;
      });
      const sum = weights.reduce((a, b) => a + b, 0);
      return weights.map(w => w / sum);
    });
  }, []);

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">BERT: Masked Language Modeling</h3>
        <div className="flex gap-2">
          {(['input', 'attention', 'predict'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStep(s);
                if (s === 'predict') setShowPredictions(true);
              }}
              className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                step === s
                  ? 'border-accent text-accent bg-accent/10'
                  : 'border-border text-text-secondary hover:border-accent/50'
              }`}
            >
              {s === 'input' ? '1. Input' : s === 'attention' ? '2. Attention' : '3. Predict'}
            </button>
          ))}
        </div>
      </div>

      {/* Token display */}
      <div className="flex justify-center gap-2 mb-6">
        {SENTENCE.map((token, i) => (
          <motion.div
            key={i}
            className={`px-3 py-2 rounded-lg border text-sm font-mono cursor-pointer ${
              token === '[MASK]'
                ? 'border-accent bg-accent/20 text-accent'
                : hoveredToken === i
                ? 'border-accent/50 bg-bg'
                : 'border-border bg-bg'
            }`}
            onMouseEnter={() => setHoveredToken(i)}
            onMouseLeave={() => setHoveredToken(null)}
            animate={{
              scale: hoveredToken === i ? 1.05 : 1,
            }}
          >
            {token}
          </motion.div>
        ))}
      </div>

      {/* Bidirectional arrows */}
      {step === 'attention' && (
        <div className="mb-6">
          <div className="text-center text-xs text-text-secondary mb-2">
            Bidirectional Attention: each token sees all others
          </div>
          <svg className="w-full h-16" viewBox="0 0 400 60">
            <defs>
              <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="rgb(99, 102, 241)" />
              </marker>
            </defs>
            {/* Left arrows pointing to mask */}
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.path
                key={`left-${i}`}
                d={`M ${50 + i * 50} 50 Q ${150} 10 ${200} 50`}
                fill="none"
                stroke="rgb(99, 102, 241)"
                strokeWidth="1.5"
                strokeOpacity="0.5"
                markerEnd="url(#arrowhead)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              />
            ))}
            {/* Right arrow */}
            <motion.path
              d="M 350 50 Q 275 10 225 50"
              fill="none"
              stroke="rgb(99, 102, 241)"
              strokeWidth="1.5"
              strokeOpacity="0.5"
              markerEnd="url(#arrowhead)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            />
          </svg>
        </div>
      )}

      {/* Attention matrix for hovered token */}
      {step === 'attention' && hoveredToken !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-bg rounded-lg border border-border"
        >
          <div className="text-sm text-text-secondary mb-2">
            Attention from <span className="text-accent font-mono">{SENTENCE[hoveredToken]}</span>:
          </div>
          <div className="flex gap-1">
            {attentionWeights[hoveredToken].map((weight, j) => (
              <div key={j} className="flex flex-col items-center gap-1">
                <div
                  className="w-10 rounded"
                  style={{
                    height: `${weight * 100}px`,
                    backgroundColor: `rgba(99, 102, 241, ${weight * 2})`,
                  }}
                />
                <span className="text-xs text-text-secondary">{SENTENCE[j]}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Predictions */}
      <AnimatePresence>
        {step === 'predict' && showPredictions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-bg rounded-lg border border-border"
          >
            <div className="text-sm text-text-secondary mb-3">
              Predictions for <span className="text-accent font-mono">[MASK]</span>:
            </div>
            <div className="space-y-2">
              {PREDICTIONS.map((pred, i) => (
                <motion.div
                  key={pred}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <span className="w-16 text-sm font-mono">{pred}</span>
                  <div className="flex-1 h-6 bg-bg-secondary rounded overflow-hidden">
                    <motion.div
                      className="h-full bg-accent/60 rounded"
                      initial={{ width: 0 }}
                      animate={{ width: `${PROBABILITIES[i] * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    />
                  </div>
                  <span className="text-xs text-text-secondary w-12 text-right">
                    {(PROBABILITIES[i] * 100).toFixed(1)}%
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info panel */}
      <div className="mt-6 p-4 bg-bg rounded-lg border border-border">
        <div className="text-sm">
          {step === 'input' && (
            <span>
              <strong>Step 1:</strong> 15% of tokens are masked. BERT must predict them using context from <em>both directions</em>.
            </span>
          )}
          {step === 'attention' && (
            <span>
              <strong>Step 2:</strong> Each token attends to all other tokens simultaneously. The [MASK] token gathers information from the entire sentence.
            </span>
          )}
          {step === 'predict' && (
            <span>
              <strong>Step 3:</strong> BERT outputs a probability distribution over the vocabulary for the masked position. "mat" fits best given "cat sat on the ___".
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
