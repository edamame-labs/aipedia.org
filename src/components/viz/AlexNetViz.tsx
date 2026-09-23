import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../lib/motion';
import { createRng } from '../../lib/rng';

interface Layer {
  name: string;
  type: 'conv' | 'pool' | 'fc' | 'input';
  shape: [number, number, number];
  params?: string;
  details: string;
}

const LAYERS: Layer[] = [
  { name: 'Input', type: 'input', shape: [224, 224, 3], details: 'RGB image input' },
  { name: 'Conv1', type: 'conv', shape: [55, 55, 96], params: '11×11, stride 4', details: '96 filters, ReLU, LRN, MaxPool 3×3' },
  { name: 'Conv2', type: 'conv', shape: [27, 27, 256], params: '5×5, pad 2', details: '256 filters, ReLU, LRN, MaxPool 3×3' },
  { name: 'Conv3', type: 'conv', shape: [13, 13, 384], params: '3×3, pad 1', details: '384 filters, ReLU' },
  { name: 'Conv4', type: 'conv', shape: [13, 13, 384], params: '3×3, pad 1', details: '384 filters, ReLU' },
  { name: 'Conv5', type: 'conv', shape: [13, 13, 256], params: '3×3, pad 1', details: '256 filters, ReLU, MaxPool 3×3 → 6×6×256' },
  { name: 'FC6', type: 'fc', shape: [1, 1, 4096], params: 'Dropout 0.5', details: '4096 neurons, ReLU' },
  { name: 'FC7', type: 'fc', shape: [1, 1, 4096], params: 'Dropout 0.5', details: '4096 neurons, ReLU' },
  { name: 'FC8', type: 'fc', shape: [1, 1, 1000], params: 'Softmax', details: '1000 ImageNet classes' },
];

const INNOVATIONS = [
  { key: 'relu', name: 'ReLU', desc: 'Non-saturating nonlinearity, 6× faster training' },
  { key: 'dropout', name: 'Dropout', desc: 'Randomly zero 50% of neurons to reduce overfitting' },
  { key: 'lrn', name: 'Local Response Normalization', desc: 'Lateral inhibition inspired normalization' },
  { key: 'augment', name: 'Data Augmentation', desc: 'Random crops, flips, PCA color jittering' },
  { key: 'gpu', name: 'Dual GPU Training', desc: 'Model parallelism across two GTX 580s' },
];

function generateFeatureMap(width: number, height: number, channels: number): number[][] {
  const random = createRng(27124 + width * 31 + height);
  const map: number[][] = [];
  const scale = Math.min(width, height);
  for (let i = 0; i < Math.min(8, Math.ceil(Math.sqrt(channels))); i++) {
    const row: number[] = [];
    for (let j = 0; j < Math.min(8, Math.ceil(Math.sqrt(channels))); j++) {
      row.push(random() * 0.7 + 0.3);
    }
    map.push(row);
  }
  return map;
}

export function AlexNetViz() {
  const [selectedLayer, setSelectedLayer] = useState(0);
  const [highlightedInnovation, setHighlightedInnovation] = useState<string | null>(null);

  const featureMaps = useMemo(
    () => LAYERS.map(l => generateFeatureMap(l.shape[0], l.shape[1], l.shape[2])),
    []
  );

  const layer = LAYERS[selectedLayer];
  const featureMap = featureMaps[selectedLayer];

  const getLayerColor = (type: string) => {
    switch (type) {
      case 'input': return 'rgb(34, 197, 94)';
      case 'conv': return 'rgb(99, 102, 241)';
      case 'pool': return 'rgb(249, 115, 22)';
      case 'fc': return 'rgb(236, 72, 153)';
      default: return 'rgb(156, 163, 175)';
    }
  };

  const maxWidth = 224;
  const getScaledWidth = (shape: [number, number, number]) => {
    return Math.max(20, (shape[0] / 224) * 120);
  };

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">AlexNet Architecture</h3>
        <div className="text-xs text-text-secondary">
          60M parameters | ImageNet 2012 Winner
        </div>
      </div>

      <div className="flex items-end justify-center gap-1 mb-6 h-32 overflow-x-auto pb-2">
        {LAYERS.map((l, i) => {
          const width = getScaledWidth(l.shape);
          const height = Math.max(24, (l.shape[2] / 256) * 80 + 20);
          const isSelected = selectedLayer === i;
          
          return (
            <motion.div
              key={l.name}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => setSelectedLayer(i)}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="rounded-md flex items-center justify-center text-xs font-medium text-white"
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  backgroundColor: getLayerColor(l.type),
                  opacity: isSelected ? 1 : 0.6,
                  border: isSelected ? '2px solid white' : 'none',
                }}
                animate={{
                  scale: isSelected ? 1.05 : 1,
                }}
              >
                {l.shape[2]}
              </motion.div>
              <span className={`text-xs mt-1 ${isSelected ? 'text-accent' : 'text-text-secondary'}`}>
                {l.name}
              </span>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedLayer}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-bg rounded-lg border border-border p-4 mb-6"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-semibold text-accent">{layer.name}</h4>
              <p className="text-sm text-text-secondary">{layer.details}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono">
                {layer.shape[0]}×{layer.shape[1]}×{layer.shape[2]}
              </div>
              {layer.params && (
                <div className="text-xs text-text-secondary">{layer.params}</div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs text-text-secondary mb-2">Feature Maps (simulated)</div>
            <div className="flex gap-1 flex-wrap">
              {featureMap.map((row, i) =>
                row.map((val, j) => (
                  <motion.div
                    key={`${i}-${j}`}
                    className="rounded-sm"
                    style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: getLayerColor(layer.type),
                      opacity: val,
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (i * row.length + j) * 0.02 }}
                  />
                ))
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div>
        <h4 className="text-sm font-medium mb-3">Key Innovations</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {INNOVATIONS.map((inn) => (
            <motion.div
              key={inn.key}
              className="p-3 bg-bg rounded-lg border border-border cursor-pointer"
              onMouseEnter={() => setHighlightedInnovation(inn.key)}
              onMouseLeave={() => setHighlightedInnovation(null)}
              animate={{
                borderColor: highlightedInnovation === inn.key ? 'rgb(99, 102, 241)' : undefined,
              }}
            >
              <div className="text-sm font-medium">{inn.name}</div>
              <div className="text-xs text-text-secondary">{inn.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgb(34, 197, 94)' }} />
          <span className="text-text-secondary">Input</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgb(99, 102, 241)' }} />
          <span className="text-text-secondary">Conv</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgb(236, 72, 153)' }} />
          <span className="text-text-secondary">FC</span>
        </div>
      </div>
    </div>
  );
}
