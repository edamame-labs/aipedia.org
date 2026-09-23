import { useState } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

interface Model {
  name: string;
  modelBits: number;
  errorBits: number;
  description: string;
}

const MODELS: Model[] = [
  { name: 'Constant', modelBits: 5, errorBits: 80, description: 'y = c' },
  { name: 'Linear', modelBits: 15, errorBits: 40, description: 'y = ax + b' },
  { name: 'Quadratic', modelBits: 25, errorBits: 20, description: 'y = ax² + bx + c' },
  { name: 'Polynomial-10', modelBits: 100, errorBits: 5, description: '10th degree polynomial' },
  { name: 'Lookup Table', modelBits: 200, errorBits: 0, description: 'Memorize all points' },
];

export function MDLTutorialViz() {
  const [selected, setSelected] = useState(2);

  const model = MODELS[selected];
  const totalBits = model.modelBits + model.errorBits;
  const minTotal = Math.min(...MODELS.map(m => m.modelBits + m.errorBits));

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">MDL Principle</h3>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4 mb-4">
        <div className="text-xs text-text-secondary mb-3">Model Comparison</div>
        <div className="space-y-2">
          {MODELS.map((m, i) => {
            const total = m.modelBits + m.errorBits;
            const isOptimal = total === minTotal;
            return (
              <div
                key={m.name}
                className={`p-2 rounded cursor-pointer ${
                  selected === i ? 'bg-accent/20 border border-accent' : 'hover:bg-bg-secondary'
                }`}
                onClick={() => setSelected(i)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{m.name}</span>
                  <span className={`text-xs ${isOptimal ? 'text-green-500' : 'text-text-secondary'}`}>
                    {total} bits {isOptimal && '(optimal)'}
                  </span>
                </div>
                <div className="flex gap-1 h-4">
                  <motion.div
                    className="bg-accent rounded-l"
                    initial={{ width: 0 }}
                    animate={{ width: `${(m.modelBits / 200) * 100}%` }}
                  />
                  <motion.div
                    className="bg-orange-500 rounded-r"
                    initial={{ width: 0 }}
                    animate={{ width: `${(m.errorBits / 200) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-accent rounded" />
            <span className="text-text-secondary">Model bits</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded" />
            <span className="text-text-secondary">Error bits</span>
          </div>
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4 mb-4">
        <div className="text-sm font-medium mb-2">Selected: {model.name}</div>
        <div className="font-mono text-xs bg-bg-secondary p-2 rounded mb-2">
          {model.description}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-accent">{model.modelBits}</div>
            <div className="text-xs text-text-secondary">Model</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-500">{model.errorBits}</div>
            <div className="text-xs text-text-secondary">Errors</div>
          </div>
          <div>
            <div className="text-lg font-bold">{totalBits}</div>
            <div className="text-xs text-text-secondary">Total</div>
          </div>
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4">
        <div className="text-sm font-medium mb-2">The Trade-off</div>
        <div className="text-xs text-text-secondary">
          Simple models need few bits but make many errors. Complex models fit 
          perfectly but require many bits to describe. MDL finds the sweet spot.
        </div>
      </div>
    </div>
  );
}
