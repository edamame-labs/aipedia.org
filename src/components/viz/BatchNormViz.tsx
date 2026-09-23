import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';
import { createRng } from '../../lib/rng';

function generateActivations(count: number, epoch: number, normalized: boolean): number[] {
  const random = createRng(38277 + epoch * 101 + (normalized ? 7 : 0));
  const baseShift = normalized ? 0 : epoch * 0.3;
  const baseScale = normalized ? 1 : 1 + epoch * 0.2;

  return Array.from({ length: count }, () => {
    const raw = (random() - 0.5) * 2 * baseScale + baseShift;
    if (normalized) {
      // Simulate normalized distribution (centered, unit variance)
      return (random() - 0.5) * 2;
    }
    return raw;
  });
}

export function BatchNormViz() {
  const [epoch, setEpoch] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [showNormalized, setShowNormalized] = useState(true);

  const maxEpochs = 20;

  const rawActivations = useMemo(
    () => generateActivations(50, epoch, false),
    [epoch]
  );

  const normalizedActivations = useMemo(
    () => generateActivations(50, epoch, true),
    [epoch]
  );

  const activations = showNormalized ? normalizedActivations : rawActivations;

  // Calculate statistics
  const mean = activations.reduce((a, b) => a + b, 0) / activations.length;
  const variance =
    activations.reduce((a, b) => a + (b - mean) ** 2, 0) / activations.length;
  const std = Math.sqrt(variance);

  useEffect(() => {
    if (isTraining && epoch < maxEpochs) {
      const timer = setTimeout(() => {
        setEpoch((e) => e + 1);
      }, 300);
      return () => clearTimeout(timer);
    } else if (epoch >= maxEpochs) {
      setIsTraining(false);
    }
  }, [isTraining, epoch]);

  const handleToggle = () => {
    if (epoch >= maxEpochs) {
      setEpoch(0);
    }
    setIsTraining(!isTraining);
  };

  // Histogram bins
  const binCount = 20;
  const binWidth = 4 / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => {
    const start = -2 + i * binWidth;
    const end = start + binWidth;
    return activations.filter((a) => a >= start && a < end).length;
  });
  const maxBin = Math.max(...bins, 1);

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Batch Normalization Effect</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">Epoch: {epoch}/{maxEpochs}</span>
          <button
            onClick={handleToggle}
            className="px-3 py-1 text-xs rounded-md border border-accent text-accent hover:bg-accent/10"
          >
            {isTraining ? 'Pause' : epoch >= maxEpochs ? 'Reset' : 'Train'}
          </button>
        </div>
      </div>

      {/* Toggle between normalized and unnormalized */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setShowNormalized(false)}
          className={`px-3 py-1 text-xs rounded-md border transition-colors ${
            !showNormalized
              ? 'border-red-500 text-red-500 bg-red-500/10'
              : 'border-border text-text-secondary hover:border-red-500/50'
          }`}
        >
          Without BatchNorm
        </button>
        <button
          onClick={() => setShowNormalized(true)}
          className={`px-3 py-1 text-xs rounded-md border transition-colors ${
            showNormalized
              ? 'border-green-500 text-green-500 bg-green-500/10'
              : 'border-border text-text-secondary hover:border-green-500/50'
          }`}
        >
          With BatchNorm
        </button>
      </div>

      {/* Activation distribution */}
      <div className="mb-6">
        <div className="text-sm text-text-secondary mb-2">Activation Distribution</div>
        <div className="bg-bg rounded-lg border border-border p-4">
          {/* Histogram */}
          <svg className="w-full h-32">
            {bins.map((count, i) => {
              const x = (i / binCount) * 100;
              const height = (count / maxBin) * 100;
              return (
                <motion.rect
                  key={i}
                  x={`${x}%`}
                  y={`${100 - height}%`}
                  width={`${100 / binCount - 0.5}%`}
                  height={`${height}%`}
                  fill={showNormalized ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
                  opacity={0.6}
                  rx={2}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%`, y: `${100 - height}%` }}
                  transition={{ duration: 0.2 }}
                />
              );
            })}
            {/* Zero line */}
            <line
              x1="50%"
              y1="0"
              x2="50%"
              y2="100%"
              stroke="rgb(99, 102, 241)"
              strokeWidth="1"
              strokeDasharray="4"
            />
          </svg>
          {/* X-axis labels */}
          <div className="flex justify-between text-xs text-text-secondary mt-1">
            <span>-2</span>
            <span>0</span>
            <span>+2</span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-bg rounded-lg border border-border text-center">
          <div className="text-xs text-text-secondary">Mean (μ)</div>
          <motion.div
            className="text-lg font-mono"
            animate={{
              color: Math.abs(mean) < 0.3 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
            }}
          >
            {mean.toFixed(2)}
          </motion.div>
          <div className="text-xs text-text-secondary">Target: 0</div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border text-center">
          <div className="text-xs text-text-secondary">Std Dev (σ)</div>
          <motion.div
            className="text-lg font-mono"
            animate={{
              color: Math.abs(std - 1) < 0.3 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
            }}
          >
            {std.toFixed(2)}
          </motion.div>
          <div className="text-xs text-text-secondary">Target: 1</div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border text-center">
          <div className="text-xs text-text-secondary">Variance (σ²)</div>
          <div className="text-lg font-mono">{variance.toFixed(2)}</div>
          <div className="text-xs text-text-secondary">Target: 1</div>
        </div>
      </div>

      {/* Formula */}
      <div className="p-4 bg-bg rounded-lg border border-border mb-4">
        <div className="text-sm font-medium mb-2">BatchNorm Transform</div>
        <div className="font-mono text-sm text-center">
          <span className="text-accent">ŷ</span> = γ ·{' '}
          <span className="text-text-secondary">(</span>
          <span className="text-accent">x</span> - μ
          <span className="text-text-secondary">)</span> / σ + β
        </div>
        <div className="text-xs text-text-secondary text-center mt-2">
          γ (scale) and β (shift) are learnable parameters
        </div>
      </div>

      {/* Explanation */}
      <div className="p-4 bg-bg rounded-lg border border-border text-sm">
        {showNormalized ? (
          <span className="text-green-400">
            <strong>With BatchNorm:</strong> Activations stay centered (μ≈0) with unit variance (σ≈1)
            throughout training. This stabilizes gradients and allows higher learning rates.
          </span>
        ) : (
          <span className="text-red-400">
            <strong>Without BatchNorm:</strong> As training progresses (epoch {epoch}), activation
            distributions shift and scale unpredictably. This "internal covariate shift" slows
            training and can cause gradient issues.
          </span>
        )}
      </div>
    </div>
  );
}
