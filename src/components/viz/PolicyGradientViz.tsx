import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';
const ACTIONS = ['←', '→', '↑', '↓'];

export function PolicyGradientViz() {
  const [policy, setPolicy] = useState([0.25, 0.25, 0.25, 0.25]);
  const [episode, setEpisode] = useState(0);
  const [lastAction, setLastAction] = useState<number | null>(null);
  const [lastReward, setLastReward] = useState<number | null>(null);
  const [isTraining, setIsTraining] = useState(false);

  // Simulate: action 1 (→) is the "good" action
  const goodAction = 1;

  useEffect(() => {
    if (!isTraining) return;

    const interval = setInterval(() => {
      // Sample action from policy
      const r = Math.random();
      let cumsum = 0;
      let action = 0;
      for (let i = 0; i < policy.length; i++) {
        cumsum += policy[i];
        if (r < cumsum) {
          action = i;
          break;
        }
      }

      // Get reward (1 if good action, 0 otherwise)
      const reward = action === goodAction ? 1 : 0;
      setLastAction(action);
      setLastReward(reward);
      setEpisode(e => e + 1);

      // Policy gradient update
      const lr = 0.1;
      setPolicy(p => {
        const newP = [...p];
        // Increase probability of action taken proportional to reward
        const advantage = reward - 0.5; // baseline
        for (let i = 0; i < newP.length; i++) {
          if (i === action) {
            newP[i] += lr * advantage * newP[i] * (1 - newP[i]);
          } else {
            newP[i] -= lr * advantage * newP[i] * p[action];
          }
        }
        // Normalize
        const sum = newP.reduce((a, b) => a + Math.max(0.01, b), 0);
        return newP.map(v => Math.max(0.01, v) / sum);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isTraining, policy]);

  const reset = useCallback(() => {
    setPolicy([0.25, 0.25, 0.25, 0.25]);
    setEpisode(0);
    setLastAction(null);
    setLastReward(null);
    setIsTraining(false);
  }, []);

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Policy Gradient Learning</h3>
        <span className="text-sm text-text-secondary">Episode: {episode}</span>
      </div>

      <p className="text-sm text-text-secondary mb-4">
        Goal: Learn that action "→" gives reward. Policy starts uniform, then learns.
      </p>

      <div className="flex justify-center gap-4 mb-6">
        {ACTIONS.map((a, i) => (
          <div key={i} className="text-center">
            <motion.div
              className={`w-16 h-16 rounded-lg border flex items-center justify-center text-2xl ${
                i === goodAction ? 'border-green-500' : 'border-border'
              } ${lastAction === i ? 'bg-accent/20' : 'bg-bg'}`}
              animate={{ scale: lastAction === i ? 1.1 : 1 }}
            >
              {a}
            </motion.div>
            <div className="mt-2">
              <div className="w-16 bg-bg-secondary rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${i === goodAction ? 'bg-green-500' : 'bg-accent'}`}
                  animate={{ width: `${policy[i] * 100}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <div className="text-xs font-mono mt-1">{(policy[i] * 100).toFixed(0)}%</div>
            </div>
          </div>
        ))}
      </div>

      {lastAction !== null && (
        <div className="mb-4 p-3 bg-bg rounded-lg border border-border text-center">
          <span className="text-text-secondary">Action: </span>
          <span className="font-medium">{ACTIONS[lastAction]}</span>
          <span className="text-text-secondary"> → Reward: </span>
          <span className={`font-medium ${lastReward === 1 ? 'text-green-500' : 'text-red-400'}`}>
            {lastReward}
          </span>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setIsTraining(!isTraining)}
          className="px-4 py-2 text-sm rounded-md bg-accent text-white hover:bg-accent/90"
        >
          {isTraining ? 'Pause' : 'Train'}
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
          <span className="text-accent font-medium">Update rule:</span> Increase π(a|s) when action a 
          gets positive advantage, decrease when negative. ∇log π(a|s) × advantage.
        </p>
      </div>
    </div>
  );
}
