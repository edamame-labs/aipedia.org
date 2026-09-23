import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

const LAYERS = [
  { name: 'Input', neurons: 3 },
  { name: 'Hidden 1', neurons: 4 },
  { name: 'Hidden 2', neurons: 4 },
  { name: 'Output', neurons: 2 },
];

export function BackpropViz() {
  const [phase, setPhase] = useState<'forward' | 'backward'>('forward');
  const [activeLayer, setActiveLayer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setActiveLayer(prev => {
        if (phase === 'forward') {
          if (prev >= LAYERS.length - 1) {
            setPhase('backward');
            return LAYERS.length - 1;
          }
          return prev + 1;
        } else {
          if (prev <= 0) {
            setIsRunning(false);
            setPhase('forward');
            return 0;
          }
          return prev - 1;
        }
      });
    }, 600);

    return () => clearInterval(interval);
  }, [isRunning, phase]);

  const neuronRadius = 16;
  const layerSpacing = 100;
  const neuronSpacing = 40;
  const svgWidth = (LAYERS.length - 1) * layerSpacing + 80;
  const maxNeurons = Math.max(...LAYERS.map(l => l.neurons));
  const svgHeight = maxNeurons * neuronSpacing + 40;

  const getNeuronY = (layerIdx: number, neuronIdx: number) => {
    const layer = LAYERS[layerIdx];
    const totalHeight = (layer.neurons - 1) * neuronSpacing;
    const startY = (svgHeight - totalHeight) / 2;
    return startY + neuronIdx * neuronSpacing;
  };

  const getNeuronX = (layerIdx: number) => 40 + layerIdx * layerSpacing;

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Backpropagation Flow</h3>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded ${
            phase === 'forward' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-400'
          }`}>
            {phase === 'forward' ? '→ Forward' : '← Backward'}
          </span>
        </div>
      </div>

      <div className="flex justify-center mb-4 overflow-x-auto">
        <svg width={svgWidth} height={svgHeight}>
          {/* Connections */}
          {LAYERS.slice(0, -1).map((layer, li) => (
            LAYERS[li].neurons > 0 && LAYERS[li + 1].neurons > 0 &&
            Array.from({ length: layer.neurons }).map((_, ni) =>
              Array.from({ length: LAYERS[li + 1].neurons }).map((_, nj) => {
                const isActive = phase === 'forward'
                  ? li === activeLayer - 1
                  : li === activeLayer;
                return (
                  <motion.line
                    key={`${li}-${ni}-${nj}`}
                    x1={getNeuronX(li) + neuronRadius}
                    y1={getNeuronY(li, ni)}
                    x2={getNeuronX(li + 1) - neuronRadius}
                    y2={getNeuronY(li + 1, nj)}
                    stroke={isActive ? (phase === 'forward' ? '#22c55e' : '#f97316') : 'var(--border)'}
                    strokeWidth={isActive ? 2 : 1}
                    animate={{ opacity: isActive ? 1 : 0.3 }}
                  />
                );
              })
            )
          ))}

          {/* Neurons */}
          {LAYERS.map((layer, li) =>
            Array.from({ length: layer.neurons }).map((_, ni) => {
              const isActive = li === activeLayer;
              return (
                <motion.circle
                  key={`n-${li}-${ni}`}
                  cx={getNeuronX(li)}
                  cy={getNeuronY(li, ni)}
                  r={neuronRadius}
                  fill={isActive ? (phase === 'forward' ? '#22c55e' : '#f97316') : 'var(--bg)'}
                  stroke={isActive ? (phase === 'forward' ? '#22c55e' : '#f97316') : 'var(--border)'}
                  strokeWidth={2}
                  animate={{ scale: isActive ? 1.1 : 1 }}
                />
              );
            })
          )}

          {/* Layer labels */}
          {LAYERS.map((layer, li) => (
            <text
              key={`label-${li}`}
              x={getNeuronX(li)}
              y={svgHeight - 5}
              textAnchor="middle"
              className="text-xs fill-text-secondary"
            >
              {layer.name}
            </text>
          ))}
        </svg>
      </div>

      <div className="flex gap-2 justify-center mb-4">
        <button
          onClick={() => { setIsRunning(true); setPhase('forward'); setActiveLayer(0); }}
          disabled={isRunning}
          className="px-4 py-2 text-sm rounded-md bg-accent text-white hover:bg-accent/90 disabled:opacity-50"
        >
          Run
        </button>
        <button
          onClick={() => { setIsRunning(false); setPhase('forward'); setActiveLayer(0); }}
          className="px-4 py-2 text-sm rounded-md bg-bg border border-border hover:border-accent"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-bg rounded-lg border border-green-500/30">
          <div className="text-xs text-green-500 font-medium mb-1">Forward Pass</div>
          <p className="text-xs text-text-secondary">
            Compute activations layer by layer: a = σ(Wa + b)
          </p>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-orange-500/30">
          <div className="text-xs text-orange-400 font-medium mb-1">Backward Pass</div>
          <p className="text-xs text-text-secondary">
            Propagate gradients: δ = (W^T δ) ⊙ σ'(z)
          </p>
        </div>
      </div>
    </div>
  );
}
