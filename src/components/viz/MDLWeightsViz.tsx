import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';
import { createRng } from '../../lib/rng';

function generateWeights(n: number, noiseLevel: number): number[] {
  const random = createRng(11003 + Math.round(noiseLevel * 1000));
  return Array.from({ length: n }, () => {
    const base = (random() - 0.5) * 2;
    return base + (random() - 0.5) * noiseLevel * 0.5;
  });
}

export function MDLWeightsViz() {
  const [noiseLevel, setNoiseLevel] = useState(0.3);
  const [precision, setPrecision] = useState(8);

  const weights = useMemo(() => generateWeights(50, noiseLevel), [noiseLevel]);
  const jitter = useMemo(() => {
    const random = createRng(52217 + Math.round(noiseLevel * 1000));
    return weights.map(() => random() * noiseLevel * 20);
  }, [weights, noiseLevel]);

  const bitsPerWeight = precision;
  const totalBits = weights.length * bitsPerWeight;
  const effectiveBits = Math.round(totalBits * (1 - noiseLevel * 0.5));

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">MDL Weight Regularization</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-xs text-text-secondary mb-2">
            Noise Level: {(noiseLevel * 100).toFixed(0)}%
          </div>
          <input
            type="range"
            min="0"
            max="0.9"
            step="0.1"
            value={noiseLevel}
            onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <div className="text-xs text-text-secondary mb-2">
            Precision: {precision} bits
          </div>
          <input
            type="range"
            min="1"
            max="16"
            step="1"
            value={precision}
            onChange={(e) => setPrecision(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4 mb-4">
        <div className="text-xs text-text-secondary mb-2">Weight Distribution</div>
        <div className="flex items-end justify-center gap-px h-24">
          {weights.map((w, i) => {
            const height = Math.abs(w) * 40 + 5;
            const noise = jitter[i];
            return (
              <motion.div
                key={i}
                className="w-2 rounded-t"
                style={{
                  height: `${height + noise}px`,
                  backgroundColor: w > 0 ? 'rgb(99, 102, 241)' : 'rgb(239, 68, 68)',
                  opacity: 1 - noiseLevel * 0.5,
                }}
                initial={{ height: 0 }}
                animate={{ height: `${height + noise}px` }}
              />
            );
          })}
        </div>
        <div className="text-xs text-text-secondary text-center mt-2">
          Gaussian noise added to weights during forward pass
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-bg rounded-lg border border-border text-center">
          <div className="text-lg font-bold text-accent">{totalBits}</div>
          <div className="text-xs text-text-secondary">Nominal Bits</div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border text-center">
          <div className="text-lg font-bold text-green-500">{effectiveBits}</div>
          <div className="text-xs text-text-secondary">Effective Bits</div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border text-center">
          <div className="text-lg font-bold text-orange-500">
            {((1 - effectiveBits / totalBits) * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-text-secondary">Compression</div>
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4">
        <div className="text-sm font-medium mb-2">The MDL Trade-off</div>
        <div className="font-mono text-xs bg-bg-secondary p-2 rounded mb-2">
          Total Cost = Description(Weights) + Description(Errors|Weights)
        </div>
        <div className="text-xs text-text-secondary">
          Adding noise reduces weight precision (fewer bits to transmit) but increases 
          prediction errors. The optimal noise level balances these costs.
        </div>
      </div>
    </div>
  );
}
