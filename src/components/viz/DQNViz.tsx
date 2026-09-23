import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';
const GRID_SIZE = 4;
const GOAL = { x: 3, y: 3 };
const ACTIONS = ['↑', '↓', '←', '→'];

type Position = { x: number; y: number };

export function DQNViz() {
  const [agentPos, setAgentPos] = useState<Position>({ x: 0, y: 0 });
  const [qValues, setQValues] = useState<Record<string, number[]>>({});
  const [replayBuffer, setReplayBuffer] = useState<number>(0);
  const [episode, setEpisode] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [epsilon, setEpsilon] = useState(1.0);

  const getStateKey = (p: Position) => `${p.x},${p.y}`;
  
  const getNextPos = (pos: Position, action: number): Position => {
    const next = { ...pos };
    if (action === 0 && pos.y > 0) next.y -= 1;
    if (action === 1 && pos.y < GRID_SIZE - 1) next.y += 1;
    if (action === 2 && pos.x > 0) next.x -= 1;
    if (action === 3 && pos.x < GRID_SIZE - 1) next.x += 1;
    return next;
  };

  const getReward = (pos: Position): number => {
    if (pos.x === GOAL.x && pos.y === GOAL.y) return 10;
    return -0.1;
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setAgentPos(pos => {
        if (pos.x === GOAL.x && pos.y === GOAL.y) {
          setEpisode(e => e + 1);
          setEpsilon(eps => Math.max(0.1, eps * 0.995));
          return { x: 0, y: 0 };
        }

        const key = getStateKey(pos);
        const q = qValues[key] || [0, 0, 0, 0];
        
        // ε-greedy
        let action: number;
        if (Math.random() < epsilon) {
          action = Math.floor(Math.random() * 4);
        } else {
          action = q.indexOf(Math.max(...q));
        }

        const nextPos = getNextPos(pos, action);
        const reward = getReward(nextPos);
        
        // Update replay buffer count
        setReplayBuffer(rb => Math.min(rb + 1, 1000));

        // Q-learning update
        const nextKey = getStateKey(nextPos);
        const nextQ = qValues[nextKey] || [0, 0, 0, 0];
        const maxNextQ = Math.max(...nextQ);
        
        setQValues(prev => {
          const newQ = { ...prev };
          if (!newQ[key]) newQ[key] = [0, 0, 0, 0];
          const target = reward + 0.9 * maxNextQ;
          newQ[key][action] = newQ[key][action] + 0.1 * (target - newQ[key][action]);
          return newQ;
        });

        return nextPos;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, qValues, epsilon]);

  const reset = useCallback(() => {
    setAgentPos({ x: 0, y: 0 });
    setQValues({});
    setReplayBuffer(0);
    setEpisode(0);
    setEpsilon(1.0);
    setIsRunning(false);
  }, []);

  const cellSize = 60;

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">DQN Learning</h3>
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
                const key = `${x},${y}`;
                const q = qValues[key] || [0, 0, 0, 0];
                const maxQ = Math.max(...q);

                return (
                  <g key={`${x}-${y}`}>
                    <rect
                      x={x * cellSize}
                      y={y * cellSize}
                      width={cellSize - 1}
                      height={cellSize - 1}
                      fill={isGoal ? 'rgba(34,197,94,0.3)' : `rgba(99,102,241,${Math.min(Math.max(maxQ, 0) / 10, 0.5)})`}
                      stroke="var(--border)"
                    />
                    {isGoal && (
                      <text x={x * cellSize + cellSize / 2} y={y * cellSize + cellSize / 2 + 6} textAnchor="middle" className="text-lg">
                        🎯
                      </text>
                    )}
                    {!isGoal && maxQ > 0 && (
                      <text
                        x={x * cellSize + cellSize / 2}
                        y={y * cellSize + cellSize / 2 + 4}
                        textAnchor="middle"
                        className="text-xs fill-text-secondary"
                      >
                        {maxQ.toFixed(1)}
                      </text>
                    )}
                  </g>
                );
              })
            )}
            <motion.circle
              cx={agentPos.x * cellSize + cellSize / 2}
              cy={agentPos.y * cellSize + cellSize / 2}
              r={cellSize / 4}
              fill="var(--accent)"
              animate={{
                cx: agentPos.x * cellSize + cellSize / 2,
                cy: agentPos.y * cellSize + cellSize / 2,
              }}
              transition={{ duration: 0.08 }}
            />
          </svg>
        </div>

        <div className="flex-1 space-y-3">
          <div className="p-3 bg-bg rounded-lg border border-border">
            <div className="text-xs text-text-secondary">Replay Buffer</div>
            <div className="text-lg font-mono">{replayBuffer}/1000</div>
          </div>
          <div className="p-3 bg-bg rounded-lg border border-border">
            <div className="text-xs text-text-secondary">Exploration ε</div>
            <div className="text-lg font-mono">{epsilon.toFixed(2)}</div>
          </div>
          <div className="p-3 bg-bg rounded-lg border border-border">
            <div className="text-xs text-text-secondary">Target Network</div>
            <div className="text-sm">Updates every 100 steps</div>
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

      <div className="mt-4 p-3 bg-bg rounded-lg border border-border">
        <p className="text-xs text-text-secondary">
          <span className="text-accent font-medium">DQN innovations:</span> Experience replay (random sampling) 
          + target network (stable targets) = stable deep Q-learning.
        </p>
      </div>
    </div>
  );
}
