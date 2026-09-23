import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

const PROMPT = ['The', 'quick', 'brown', 'fox'];
const GENERATED = ['jumps', 'over', 'the', 'lazy', 'dog'];

export function GPTViz() {
  const [generatedCount, setGeneratedCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAttention, setShowAttention] = useState(false);

  const allTokens = [...PROMPT, ...GENERATED.slice(0, generatedCount)];
  const currentToken = generatedCount < GENERATED.length ? GENERATED[generatedCount] : null;

  useEffect(() => {
    if (isGenerating && generatedCount < GENERATED.length) {
      const timer = setTimeout(() => {
        setGeneratedCount((c) => c + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (generatedCount >= GENERATED.length) {
      setIsGenerating(false);
    }
  }, [isGenerating, generatedCount]);

  const handleGenerate = () => {
    if (generatedCount >= GENERATED.length) {
      setGeneratedCount(0);
    }
    setIsGenerating(true);
  };

  const handleStop = () => {
    setIsGenerating(false);
  };

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">GPT: Autoregressive Generation</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAttention(!showAttention)}
            className={`px-3 py-1 text-xs rounded-md border transition-colors ${
              showAttention
                ? 'border-accent text-accent bg-accent/10'
                : 'border-border text-text-secondary hover:border-accent/50'
            }`}
          >
            {showAttention ? 'Hide' : 'Show'} Attention
          </button>
          <button
            onClick={isGenerating ? handleStop : handleGenerate}
            className="px-3 py-1 text-xs rounded-md border border-accent text-accent hover:bg-accent/10"
          >
            {isGenerating ? 'Stop' : generatedCount >= GENERATED.length ? 'Reset' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Token sequence */}
      <div className="flex flex-wrap gap-2 mb-6 min-h-[48px]">
        {PROMPT.map((token, i) => (
          <motion.div
            key={`prompt-${i}`}
            className="px-3 py-2 rounded-lg border border-border bg-bg text-sm font-mono"
          >
            {token}
          </motion.div>
        ))}
        {GENERATED.slice(0, generatedCount).map((token, i) => (
          <motion.div
            key={`gen-${i}`}
            className="px-3 py-2 rounded-lg border border-accent bg-accent/20 text-accent text-sm font-mono"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {token}
          </motion.div>
        ))}
        {isGenerating && currentToken && (
          <motion.div
            className="px-3 py-2 rounded-lg border border-dashed border-accent/50 text-accent/50 text-sm font-mono"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            {currentToken}?
          </motion.div>
        )}
      </div>

      {/* Causal attention visualization */}
      {showAttention && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6"
        >
          <div className="text-xs text-text-secondary mb-2">
            Causal Attention Mask (each token only sees previous tokens)
          </div>
          <div className="overflow-x-auto">
            <div className="inline-block">
              <div className="flex gap-1 mb-1">
                <div className="w-12" />
                {allTokens.map((t, i) => (
                  <div
                    key={i}
                    className="w-12 text-xs text-center text-text-secondary truncate"
                  >
                    {t}
                  </div>
                ))}
              </div>
              {allTokens.map((token, i) => (
                <div key={i} className="flex gap-1 mb-1">
                  <div className="w-12 text-xs text-text-secondary truncate text-right pr-1">
                    {token}
                  </div>
                  {allTokens.map((_, j) => (
                    <motion.div
                      key={j}
                      className={`w-12 h-6 rounded ${
                        j <= i
                          ? 'bg-accent/40'
                          : 'bg-red-500/20'
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (i * allTokens.length + j) * 0.02 }}
                    >
                      <div className="w-full h-full flex items-center justify-center text-xs">
                        {j <= i ? '✓' : '✗'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Probability distribution for next token */}
      {isGenerating && currentToken && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-bg rounded-lg border border-border mb-4"
        >
          <div className="text-sm text-text-secondary mb-2">
            Next token probabilities:
          </div>
          <div className="flex gap-2">
            {['the', currentToken, 'a', 'quickly', 'and'].map((word, i) => {
              const prob = word === currentToken ? 0.7 : 0.075;
              return (
                <div key={word} className="flex flex-col items-center gap-1">
                  <motion.div
                    className="w-14 rounded bg-accent/60"
                    initial={{ height: 0 }}
                    animate={{ height: prob * 80 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="text-xs text-text-secondary">{word}</span>
                  <span className="text-xs text-accent">{(prob * 100).toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Info panel */}
      <div className="p-4 bg-bg rounded-lg border border-border">
        <div className="text-sm">
          <strong>How GPT works:</strong> Given a sequence of tokens, GPT predicts the most likely next token.
          It can only attend to <em>previous</em> tokens (causal masking), making generation natural:
          each new token is sampled from the predicted distribution, then appended to the context.
        </div>
      </div>

      {/* Scale comparison */}
      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        {[
          { name: 'GPT-1', params: '117M', size: 20 },
          { name: 'GPT-2', params: '1.5B', size: 35 },
          { name: 'GPT-3', params: '175B', size: 60 },
          { name: 'GPT-4', params: '~1.7T', size: 90 },
        ].map((model) => (
          <div key={model.name} className="p-2">
            <motion.div
              className="mx-auto rounded-full bg-accent/30 flex items-center justify-center text-xs font-mono"
              style={{ width: model.size, height: model.size }}
              whileHover={{ scale: 1.1 }}
            >
              {model.name.split('-')[1]}
            </motion.div>
            <div className="text-xs text-text-secondary mt-1">{model.name}</div>
            <div className="text-xs text-accent">{model.params}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
