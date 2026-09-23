import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

interface BlockProps {
  showSkip: boolean;
  index: number;
  isBottleneck: boolean;
}

function ResidualBlock({ showSkip, index, isBottleneck }: BlockProps) {
  const delay = index * 0.1;
  const layers = isBottleneck ? ['1×1', '3×3', '1×1'] : ['3×3', '3×3'];
  
  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        className="w-12 h-6 bg-accent/20 rounded flex items-center justify-center text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay }}
      >
        x
      </motion.div>
      
      <div className="flex">
        <div className="flex flex-col items-center mx-2">
          {layers.map((layer, i) => (
            <motion.div
              key={i}
              className="w-12 h-8 my-1 bg-accent rounded flex items-center justify-center text-xs text-white font-medium"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + i * 0.05 }}
            >
              {layer}
            </motion.div>
          ))}
        </div>
        
        {showSkip && (
          <motion.svg
            className="absolute"
            width="80"
            height={layers.length * 40 + 24}
            style={{ left: '50%', top: '12px', transform: 'translateX(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
          >
            <motion.path
              d={`M 0 0 Q 30 0 30 ${layers.length * 20 + 12} Q 30 ${layers.length * 40 + 24} 0 ${layers.length * 40 + 24}`}
              fill="none"
              stroke="rgb(34, 197, 94)"
              strokeWidth="2"
              strokeDasharray="4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: delay + 0.3, duration: 0.5 }}
            />
            <motion.circle
              cx="30"
              cy={layers.length * 20 + 12}
              r="4"
              fill="rgb(34, 197, 94)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.6 }}
            />
          </motion.svg>
        )}
      </div>
      
      <motion.div
        className="w-12 h-6 bg-green-500/30 rounded flex items-center justify-center text-xs font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.4 }}
      >
        {showSkip ? 'F(x)+x' : 'F(x)'}
      </motion.div>
    </div>
  );
}

const ARCHITECTURES = [
  { name: 'ResNet-18', blocks: [2, 2, 2, 2], bottleneck: false },
  { name: 'ResNet-34', blocks: [3, 4, 6, 3], bottleneck: false },
  { name: 'ResNet-50', blocks: [3, 4, 6, 3], bottleneck: true },
  { name: 'ResNet-101', blocks: [3, 4, 23, 3], bottleneck: true },
  { name: 'ResNet-152', blocks: [3, 8, 36, 3], bottleneck: true },
];

export function ResNetViz() {
  const [showSkip, setShowSkip] = useState(true);
  const [selectedArch, setSelectedArch] = useState(2);
  const [animationKey, setAnimationKey] = useState(0);

  const toggleSkip = useCallback(() => {
    setShowSkip(s => !s);
    setAnimationKey(k => k + 1);
  }, []);

  const arch = ARCHITECTURES[selectedArch];
  const totalLayers = arch.blocks.reduce((a, b) => a + b, 0) * (arch.bottleneck ? 3 : 2) + 2;

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Residual Learning</h3>
        <button
          onClick={toggleSkip}
          className={`px-3 py-1 text-xs rounded-md border ${
            showSkip ? 'border-green-500 text-green-500' : 'border-border text-text-secondary'
          }`}
        >
          Skip Connection: {showSkip ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {ARCHITECTURES.map((a, i) => (
          <button
            key={a.name}
            onClick={() => { setSelectedArch(i); setAnimationKey(k => k + 1); }}
            className={`px-3 py-1 text-xs rounded-md border ${
              selectedArch === i ? 'border-accent text-accent' : 'border-border text-text-secondary'
            }`}
          >
            {a.name}
          </button>
        ))}
      </div>

      <div className="bg-bg rounded-lg border border-border p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">{arch.name}</span>
          <span className="text-xs text-text-secondary">
            {totalLayers} layers | {arch.bottleneck ? 'Bottleneck' : 'Basic'} blocks
          </span>
        </div>

        <div className="flex gap-4 justify-center overflow-x-auto pb-2" key={animationKey}>
          {arch.blocks.slice(0, 4).map((count, stageIdx) => (
            <div key={stageIdx} className="flex flex-col items-center">
              <div className="text-xs text-text-secondary mb-2">Stage {stageIdx + 2}</div>
              <div className="flex gap-2">
                {Array.from({ length: Math.min(count, 3) }).map((_, blockIdx) => (
                  <ResidualBlock
                    key={blockIdx}
                    showSkip={showSkip}
                    index={stageIdx * 3 + blockIdx}
                    isBottleneck={arch.bottleneck}
                  />
                ))}
                {count > 3 && (
                  <div className="flex items-center text-text-secondary text-xs">
                    +{count - 3}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">Without Skip</div>
          <div className="text-xs text-text-secondary">
            Gradients vanish in deep networks. Training 56+ layers degrades performance.
          </div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-green-500/50">
          <div className="text-sm font-medium text-green-500 mb-1">With Skip</div>
          <div className="text-xs text-text-secondary">
            Identity shortcuts provide gradient highways. 152+ layers train successfully.
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-bg rounded-lg border border-border">
        <div className="text-sm font-medium mb-2">The Key Insight</div>
        <div className="font-mono text-xs bg-bg-secondary p-2 rounded">
          <span className="text-text-secondary">Instead of learning</span>{' '}
          <span className="text-accent">H(x)</span>
          <span className="text-text-secondary">, learn the residual</span>{' '}
          <span className="text-green-500">F(x) = H(x) - x</span>
        </div>
        <div className="text-xs text-text-secondary mt-2">
          If identity is optimal, it's easier to push F(x) → 0 than to fit H(x) = x
        </div>
      </div>
    </div>
  );
}
