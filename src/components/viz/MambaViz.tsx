import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

export function MambaViz() {
  const [seqLength, setSeqLength] = useState(1000);

  const complexities = useMemo(() => {
    const transformer = seqLength * seqLength;
    const mamba = seqLength;
    return { transformer, mamba };
  }, [seqLength]);

  const maxComplexity = complexities.transformer;
  const barHeight = 30;

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Complexity Comparison</h3>
      </div>

      <div className="mb-4">
        <label className="text-xs text-text-secondary">
          Sequence Length: {seqLength.toLocaleString()} tokens
        </label>
        <input
          type="range"
          min="100"
          max="10000"
          step="100"
          value={seqLength}
          onChange={e => setSeqLength(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-red-400">Transformer O(n²)</span>
            <span className="font-mono">{complexities.transformer.toLocaleString()}</span>
          </div>
          <div className="w-full bg-bg rounded-full overflow-hidden" style={{ height: barHeight }}>
            <motion.div
              className="bg-red-400 h-full"
              animate={{ width: `${(complexities.transformer / maxComplexity) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-green-500">Mamba O(n)</span>
            <span className="font-mono">{complexities.mamba.toLocaleString()}</span>
          </div>
          <div className="w-full bg-bg rounded-full overflow-hidden" style={{ height: barHeight }}>
            <motion.div
              className="bg-green-500 h-full"
              animate={{ width: `${Math.max((complexities.mamba / maxComplexity) * 100, 1)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      <div className="p-3 bg-bg rounded-lg border border-border mb-4">
        <div className="text-sm">
          <span className="text-accent font-medium">Speedup:</span>{' '}
          <span className="font-mono text-green-500">
            {(complexities.transformer / complexities.mamba).toFixed(0)}×
          </span>
          <span className="text-text-secondary"> faster for {seqLength.toLocaleString()} tokens</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-3 bg-bg rounded-lg border border-red-500/30">
          <div className="text-xs text-red-400 mb-1">Transformer</div>
          <div className="text-sm text-text-secondary">Quadratic attention</div>
          <div className="text-xs text-text-secondary mt-1">~2k context typical</div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-green-500/30">
          <div className="text-xs text-green-500 mb-1">Mamba (SSM)</div>
          <div className="text-sm text-text-secondary">Linear recurrence</div>
          <div className="text-xs text-text-secondary mt-1">1M+ context possible</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-bg rounded-lg border border-border">
        <p className="text-xs text-text-secondary">
          <span className="text-accent font-medium">Key insight:</span> State space models process
          sequences with O(n) complexity by maintaining a fixed-size hidden state, while achieving
          comparable quality through selective gating.
        </p>
      </div>
    </div>
  );
}
