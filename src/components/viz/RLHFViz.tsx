import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../lib/motion';

const STAGES = [
  { name: 'SFT', description: 'Supervised Fine-Tuning on demonstrations' },
  { name: 'RM', description: 'Train Reward Model on preferences' },
  { name: 'PPO', description: 'Optimize policy with RL' },
];

const COMPARISONS = [
  { a: 'Here is a summary of the article...', b: 'I cannot help with that.', winner: 'a' },
  { a: 'The answer is 42.', b: 'Let me explain step by step: First...', winner: 'b' },
];

export function RLHFViz() {
  const [stage, setStage] = useState(0);
  const [compIdx, setCompIdx] = useState(0);
  const [reward, setReward] = useState(0.5);

  const currentComp = COMPARISONS[compIdx];

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">RLHF Pipeline</h3>
      </div>

      <div className="flex gap-2 mb-6">
        {STAGES.map((s, i) => (
          <button
            key={s.name}
            onClick={() => setStage(i)}
            className={`flex-1 px-4 py-3 rounded-lg border text-center transition-all ${
              stage === i
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border text-text-secondary hover:border-accent/50'
            }`}
          >
            <div className="text-sm font-medium">{s.name}</div>
            <div className="text-xs mt-1 opacity-70">{s.description}</div>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div
            key="sft"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-bg rounded-lg border border-border"
          >
            <h4 className="text-sm font-medium mb-3">Demonstration Data</h4>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-bg-secondary rounded">
                <span className="text-text-secondary">Prompt:</span> Summarize this article...
              </div>
              <div className="p-2 bg-green-500/10 border border-green-500/30 rounded">
                <span className="text-green-500">Human demo:</span> The article discusses three main points...
              </div>
            </div>
            <p className="text-xs text-text-secondary mt-3">
              Fine-tune base LLM to mimic high-quality human responses.
            </p>
          </motion.div>
        )}

        {stage === 1 && (
          <motion.div
            key="rm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-bg rounded-lg border border-border"
          >
            <h4 className="text-sm font-medium mb-3">Human Preference Comparison</h4>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className={`p-3 rounded-lg border cursor-pointer ${
                  currentComp.winner === 'a' ? 'border-green-500 bg-green-500/10' : 'border-border'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-xs text-text-secondary mb-1">Response A</div>
                <p className="text-sm">{currentComp.a}</p>
              </motion.div>
              <motion.div
                className={`p-3 rounded-lg border cursor-pointer ${
                  currentComp.winner === 'b' ? 'border-green-500 bg-green-500/10' : 'border-border'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-xs text-text-secondary mb-1">Response B</div>
                <p className="text-sm">{currentComp.b}</p>
              </motion.div>
            </div>
            <button
              onClick={() => setCompIdx((compIdx + 1) % COMPARISONS.length)}
              className="mt-3 px-3 py-1 text-xs rounded border border-border hover:border-accent"
            >
              Next comparison
            </button>
          </motion.div>
        )}

        {stage === 2 && (
          <motion.div
            key="ppo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-bg rounded-lg border border-border"
          >
            <h4 className="text-sm font-medium mb-3">PPO Optimization</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Reward Score</span>
                  <span className="text-accent">{reward.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={reward}
                  onChange={e => setReward(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>KL Penalty</span>
                  <span className="text-orange-400">{(reward * 0.3).toFixed(2)}</span>
                </div>
                <div className="w-full bg-bg-secondary rounded-full h-2">
                  <motion.div
                    className="bg-orange-400 h-2 rounded-full"
                    animate={{ width: `${reward * 30}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-text-secondary">
                Maximize reward while staying close to SFT model (KL penalty prevents reward hacking).
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
