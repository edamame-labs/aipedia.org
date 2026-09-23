import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';
const GRID_SIZE = 5;
const GOAL = { x: 4, y: 4 };
const START = { x: 0, y: 0 };

type Position = { x: number; y: number };

function getReward(pos: Position): number {
  if (pos.x === GOAL.x && pos.y === GOAL.y) return 10;
  return -0.1;
}

export function RLViz() {
  const [agentPos, setAgentPos] = useState<Position>(START);
  const [episode, setEpisode] = useState(0);
  const [totalReward, setTotalReward] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [qValues, setQValues] = useState<Record<string, Record<string, number>>>({});

  const cellSize = 48;
  const actions = ['up', 'down', 'left', 'right'];

  const getNextPos = (pos: Position, action: string): Position => {
    const next = { ...pos };
    if (action === 'up' && pos.y > 0) next.y -= 1;
    if (action === 'down' && pos.y < GRID_SIZE - 1) next.y += 1;
    if (action === 'left' && pos.x > 0) next.x -= 1;
    if (action === 'right' && pos.x < GRID_SIZE - 1) next.x += 1;
    return next;
  };

  const getStateKey = (pos: Position) => `${pos.x},${pos.y}`;

  const getBestAction = (pos: Position): string => {
    const key = getStateKey(pos);
    const q = qValues[key] || {};
    let best = actions[Math.floor(Math.random() * actions.length)];
    let bestVal = -Infinity;
    for (const a of actions) {
      if ((q[a] || 0) > bestVal) {
        bestVal = q[a] || 0;
        best = a;
      }
    }
    return best;
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setAgentPos(pos => {
        if (pos.x === GOAL.x && pos.y === GOAL.y) {
          setEpisode(e => e + 1);
          setTotalReward(0);
          return START;
        }

        const epsilon = Math.max(0.1, 1 - episode * 0.02);
        const action = Math.random() < epsilon
          ? actions[Math.floor(Math.random() * actions.length)]
          : getBestAction(pos);

        const nextPos = getNextPos(pos, action);
        const reward = getReward(nextPos);
        setTotalReward(r => r + reward);

        // Q-learning update
        const key = getStateKey(pos);
        const nextKey = getStateKey(nextPos);
        setQValues(prev => {
          const q = { ...prev };
          if (!q[key]) q[key] = {};
          const nextQ = q[nextKey] || {};
          const maxNextQ = Math.max(...actions.map(a => nextQ[a] || 0), 0);
          const oldQ = q[key][action] || 0;
          q[key][action] = oldQ + 0.1 * (reward + 0.9 * maxNextQ - oldQ);
          return q;
        });

        return nextPos;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isRunning, episode, qValues]);

  const reset = useCallback(() => {
    setAgentPos(START);
    setEpisode(0);
    setTotalReward(0);
    setQValues({});
    setIsRunning(false);
  }, []);

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Q-Learning Agent</h3>
        <span className="text-sm text-text-secondary">Episode: {episode}</span>
      </div>

      <div className="flex gap-6">
        <div>
          <svg
            width={GRID_SIZE * cellSize}
            height={GRID_SIZE * cellSize}
            className="rounded-lg border border-border"
          >
            {Array.from({ length: GRID_SIZE }).map((_, y) =>
              Array.from({ length: GRID_SIZE }).map((_, x) => {
                const isGoal = x === GOAL.x && y === GOAL.y;
                const isAgent = x === agentPos.x && y === agentPos.y;
                const key = `${x},${y}`;
                const q = qValues[key] || {};
                const maxQ = Math.max(...actions.map(a => q[a] || 0), 0);

                return (
                  <g key={`${x}-${y}`}>
                    <rect
                      x={x * cellSize}
                      y={y * cellSize}
                      width={cellSize - 1}
                      height={cellSize - 1}
                      fill={isGoal ? 'rgba(34,197,94,0.4)' : `rgba(99,102,241,${Math.min(maxQ / 5, 0.5)})`}
                      stroke="var(--border)"
                    />
                    {isGoal && (
                      <text x={x * cellSize + cellSize / 2} y={y * cellSize + cellSize / 2 + 6} textAnchor="middle" className="text-lg">
                        🎯
                      </text>
                    )}
                  </g>
                );
              })
            )}
            <motion.circle
              cx={agentPos.x * cellSize + cellSize / 2}
              cy={agentPos.y * cellSize + cellSize / 2}
              r={cellSize / 3}
              fill="var(--accent)"
              animate={{ cx: agentPos.x * cellSize + cellSize / 2, cy: agentPos.y * cellSize + cellSize / 2 }}
              transition={{ duration: 0.15 }}
            />
          </svg>
        </div>

        <div className="flex-1 space-y-3">
          <div className="p-3 bg-bg rounded-lg border border-border">
            <div className="text-xs text-text-secondary">Episode Reward</div>
            <div className="text-lg font-mono text-accent">{totalReward.toFixed(1)}</div>
          </div>
          <div className="p-3 bg-bg rounded-lg border border-border">
            <div className="text-xs text-text-secondary">Exploration ε</div>
            <div className="text-lg font-mono">{Math.max(0.1, 1 - episode * 0.02).toFixed(2)}</div>
          </div>
          <div className="text-xs text-text-secondary">
            Agent learns Q-values through trial & error. Brighter cells = higher expected reward.
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-center mt-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-4 py-2 text-sm rounded-md bg-accent text-white hover:bg-accent/90"
        >
          {isRunning ? 'Pause' : 'Run'}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 text-sm rounded-md bg-bg border border-border hover:border-accent"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
