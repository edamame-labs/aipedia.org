import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';
export function GANViz() {
  const [epoch, setEpoch] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [samples, setSamples] = useState<{ x: number; y: number; real: boolean; score: number }[]>([]);

  const maxEpochs = 50;
  const generatorQuality = Math.min(epoch / maxEpochs, 0.95);
  const discriminatorAccuracy = 0.95 - generatorQuality * 0.45;

  useEffect(() => {
    // Generate samples based on current epoch
    const newSamples: typeof samples = [];

    // Real samples (Gaussian cluster)
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 20 + Math.random() * 15;
      newSamples.push({
        x: 150 + Math.cos(angle) * r,
        y: 100 + Math.sin(angle) * r,
        real: true,
        score: 0.8 + Math.random() * 0.15,
      });
    }

    // Fake samples (initially scattered, converge to real distribution)
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const baseR = 60 - generatorQuality * 40;
      const r = baseR + Math.random() * 20 * (1 - generatorQuality);
      newSamples.push({
        x: 150 + Math.cos(angle) * r + (Math.random() - 0.5) * 30 * (1 - generatorQuality),
        y: 100 + Math.sin(angle) * r + (Math.random() - 0.5) * 30 * (1 - generatorQuality),
        real: false,
        score: 0.2 + generatorQuality * 0.6 + Math.random() * 0.1,
      });
    }

    setSamples(newSamples);
  }, [epoch, generatorQuality]);

  useEffect(() => {
    if (isTraining && epoch < maxEpochs) {
      const timer = setTimeout(() => {
        setEpoch((e) => e + 1);
      }, 200);
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

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">GAN: Adversarial Training</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary">Epoch: {epoch}/{maxEpochs}</span>
          <button
            onClick={handleToggle}
            className="px-3 py-1 text-xs rounded-md border border-accent text-accent hover:bg-accent/10"
          >
            {isTraining ? 'Pause' : epoch >= maxEpochs ? 'Reset' : 'Train'}
          </button>
        </div>
      </div>

      {/* Architecture diagram */}
      <div className="flex items-center justify-between mb-6 p-4 bg-bg rounded-lg border border-border">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center mb-2">
            <span className="text-2xl">🎲</span>
          </div>
          <div className="text-xs text-text-secondary">Noise z</div>
        </div>

        <motion.div
          className="text-2xl text-text-secondary"
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          →
        </motion.div>

        <div className="text-center">
          <motion.div
            className="w-20 h-16 mx-auto rounded-lg bg-green-500/20 border border-green-500/50 flex items-center justify-center mb-2"
            animate={{
              borderColor: isTraining ? ['rgb(34, 197, 94, 0.5)', 'rgb(34, 197, 94, 1)', 'rgb(34, 197, 94, 0.5)'] : 'rgb(34, 197, 94, 0.5)'
            }}
            transition={{ duration: 0.5, repeat: isTraining ? Infinity : 0 }}
          >
            <span className="font-mono font-bold text-green-400">G</span>
          </motion.div>
          <div className="text-xs text-text-secondary">Generator</div>
        </div>

        <motion.div
          className="text-2xl text-text-secondary"
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
        >
          →
        </motion.div>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center mb-2">
            <span className="text-2xl">🖼️</span>
          </div>
          <div className="text-xs text-text-secondary">Fake Image</div>
        </div>

        <motion.div
          className="text-2xl text-text-secondary"
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: 1 }}
        >
          →
        </motion.div>

        <div className="text-center">
          <motion.div
            className="w-20 h-16 mx-auto rounded-lg bg-red-500/20 border border-red-500/50 flex items-center justify-center mb-2"
            animate={{
              borderColor: isTraining ? ['rgb(239, 68, 68, 0.5)', 'rgb(239, 68, 68, 1)', 'rgb(239, 68, 68, 0.5)'] : 'rgb(239, 68, 68, 0.5)'
            }}
            transition={{ duration: 0.5, repeat: isTraining ? Infinity : 0, delay: 0.25 }}
          >
            <span className="font-mono font-bold text-red-400">D</span>
          </motion.div>
          <div className="text-xs text-text-secondary">Discriminator</div>
        </div>

        <motion.div
          className="text-2xl text-text-secondary"
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: 1.5 }}
        >
          →
        </motion.div>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-lg bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center mb-2">
            <span className="text-lg font-mono">0/1</span>
          </div>
          <div className="text-xs text-text-secondary">Real/Fake</div>
        </div>
      </div>

      {/* Distribution visualization */}
      <div className="mb-4">
        <div className="text-sm text-text-secondary mb-2">Sample Distribution (Real vs Generated)</div>
        <svg className="w-full h-48 bg-bg rounded-lg border border-border">
          {/* Legend */}
          <circle cx="30" cy="20" r="6" fill="rgb(34, 197, 94)" opacity="0.6" />
          <text x="42" y="24" className="text-xs fill-current text-text-secondary">Real</text>
          <circle cx="90" cy="20" r="6" fill="rgb(239, 68, 68)" opacity="0.6" />
          <text x="102" y="24" className="text-xs fill-current text-text-secondary">Fake</text>

          {/* Samples */}
          {samples.map((sample, i) => (
            <motion.circle
              key={i}
              cx={sample.x}
              cy={sample.y + 20}
              r={6}
              fill={sample.real ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
              opacity={0.6}
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                cx: sample.x,
                cy: sample.y + 20
              }}
              transition={{ duration: 0.3 }}
            />
          ))}

          {/* Target distribution outline */}
          <circle
            cx="150"
            cy="120"
            r="35"
            fill="none"
            stroke="rgb(99, 102, 241)"
            strokeWidth="2"
            strokeDasharray="4"
            opacity="0.5"
          />
          <text x="120" y="170" className="text-xs fill-current text-text-secondary">Target Distribution</text>
        </svg>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-xs text-text-secondary mb-1">Generator Quality</div>
          <div className="h-3 bg-bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${generatorQuality * 100}%` }}
            />
          </div>
          <div className="text-xs text-green-400 mt-1">{(generatorQuality * 100).toFixed(0)}%</div>
        </div>

        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-xs text-text-secondary mb-1">Discriminator Accuracy</div>
          <div className="h-3 bg-bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-red-500"
              initial={{ width: '95%' }}
              animate={{ width: `${discriminatorAccuracy * 100}%` }}
            />
          </div>
          <div className="text-xs text-red-400 mt-1">{(discriminatorAccuracy * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* Status message */}
      <div className="mt-4 p-3 bg-bg rounded-lg border border-border text-sm">
        {epoch === 0 && (
          <span>Click "Train" to watch the generator learn to fool the discriminator.</span>
        )}
        {epoch > 0 && epoch < maxEpochs && (
          <span>
            Training... Generator is learning the data distribution.
            Notice how fake samples (red) converge toward real samples (green).
          </span>
        )}
        {epoch >= maxEpochs && (
          <span className="text-accent">
            Training complete! The generator now produces samples that match the real distribution.
            The discriminator can barely tell them apart (accuracy ≈ 50%).
          </span>
        )}
      </div>
    </div>
  );
}
