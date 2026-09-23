import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';
import { createRng } from '../../lib/rng';

const LAYERS = [4, 8, 8, 4];

export function DropoutViz() {
  const [dropoutRate, setDropoutRate] = useState(0.5);
  const [isTraining, setIsTraining] = useState(true);
  const [key, setKey] = useState(0);

  const regenerate = useCallback(() => setKey(k => k + 1), []);

  // Seeded on `key` so the first render is identical on the server and in the
  // browser (this component appears on two pages, so a shared generator would
  // drift out of step during the build), while Regenerate still resamples.
  const masks = useMemo(() => {
    const random = createRng(1 + key * 7919);
    return LAYERS.map(size =>
      isTraining
        ? Array.from({ length: size }, () => random() > dropoutRate)
        : Array<boolean>(size).fill(true)
    );
  }, [key, isTraining, dropoutRate]);

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Dropout Regularization</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsTraining(true)}
            className={`px-3 py-1 text-xs rounded-md border ${
              isTraining ? 'border-accent text-accent' : 'border-border text-text-secondary'
            }`}
          >
            Training
          </button>
          <button
            onClick={() => setIsTraining(false)}
            className={`px-3 py-1 text-xs rounded-md border ${
              !isTraining ? 'border-green-500 text-green-500' : 'border-border text-text-secondary'
            }`}
          >
            Inference
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm">Dropout Rate: {(dropoutRate * 100).toFixed(0)}%</span>
          <button
            onClick={regenerate}
            className="px-2 py-1 text-xs rounded border border-border hover:border-accent"
          >
            Resample
          </button>
        </div>
        <input
          type="range"
          min="0"
          max="0.9"
          step="0.1"
          value={dropoutRate}
          onChange={(e) => { setDropoutRate(parseFloat(e.target.value)); regenerate(); }}
          className="w-full"
        />
      </div>

      <div className="bg-bg rounded-lg border border-border p-4 mb-4" key={key}>
        <svg width="100%" height="200" viewBox="0 0 400 200">
          {LAYERS.map((size, layerIdx) => {
            const x = 50 + layerIdx * 100;
            const mask = masks[layerIdx];
            
            return (
              <g key={layerIdx}>
                {Array.from({ length: size }).map((_, neuronIdx) => {
                  const y = 100 - (size - 1) * 12 + neuronIdx * 24;
                  const isActive = mask[neuronIdx];
                  
                  return (
                    <g key={neuronIdx}>
                      {layerIdx < LAYERS.length - 1 && masks[layerIdx + 1].map((nextActive, nextIdx) => {
                        if (!isActive || !nextActive) return null;
                        const nextSize = LAYERS[layerIdx + 1];
                        const nextY = 100 - (nextSize - 1) * 12 + nextIdx * 24;
                        return (
                          <motion.line
                            key={nextIdx}
                            x1={x + 10}
                            y1={y}
                            x2={x + 90}
                            y2={nextY}
                            stroke="rgb(99, 102, 241)"
                            strokeWidth="1"
                            strokeOpacity={0.3}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: layerIdx * 0.1 }}
                          />
                        );
                      })}
                      <motion.circle
                        cx={x}
                        cy={y}
                        r={8}
                        fill={isActive ? 'rgb(99, 102, 241)' : 'rgb(55, 65, 81)'}
                        stroke={isActive ? 'rgb(129, 140, 248)' : 'rgb(75, 85, 99)'}
                        strokeWidth={2}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, opacity: isActive ? 1 : 0.3 }}
                        transition={{ delay: neuronIdx * 0.02 }}
                      />
                      {!isActive && isTraining && (
                        <motion.line
                          x1={x - 6}
                          y1={y - 6}
                          x2={x + 6}
                          y2={y + 6}
                          stroke="rgb(239, 68, 68)"
                          strokeWidth={2}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        />
                      )}
                    </g>
                  );
                })}
                <text x={x} y={190} textAnchor="middle" fill="rgb(156, 163, 175)" fontSize="10">
                  {layerIdx === 0 ? 'Input' : layerIdx === LAYERS.length - 1 ? 'Output' : `Hidden ${layerIdx}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">Training</div>
          <div className="text-xs text-text-secondary">
            Randomly zero neurons with probability p. Scale remaining by 1/(1-p).
          </div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">Inference</div>
          <div className="text-xs text-text-secondary">
            Use all neurons. No scaling needed (inverted dropout).
          </div>
        </div>
      </div>

      <div className="p-4 bg-bg rounded-lg border border-border">
        <div className="text-sm font-medium mb-2">Why Dropout Works</div>
        <div className="text-xs text-text-secondary space-y-1">
          <div>• Prevents co-adaptation: neurons can't rely on specific others</div>
          <div>• Implicit ensemble: trains exponentially many sub-networks</div>
          <div>• Noise injection: adds regularization similar to data augmentation</div>
        </div>
      </div>
    </div>
  );
}
