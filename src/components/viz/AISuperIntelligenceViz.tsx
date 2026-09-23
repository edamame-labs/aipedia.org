import { useState } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

interface Concept {
  id: string;
  name: string;
  formula: string;
  description: string;
}

const CONCEPTS: Concept[] = [
  {
    id: 'intelligence',
    name: 'Universal Intelligence',
    formula: 'Υ(π) = Σμ 2^(-K(μ)) V_μ^π',
    description: 'Performance weighted by environment simplicity',
  },
  {
    id: 'aixi',
    name: 'AIXI Agent',
    formula: 'a* = argmax Σ (o,r) Σμ 2^(-K(μ)) μ(or|a)',
    description: 'Optimal action via Solomonoff induction',
  },
  {
    id: 'solomonoff',
    name: 'Solomonoff Induction',
    formula: 'P(x) = Σp:U(p)=x* 2^(-|p|)',
    description: 'Universal prior from program complexity',
  },
  {
    id: 'compression',
    name: 'Compression = Intelligence',
    formula: 'K(data|model) + K(model) → min',
    description: 'Learning is compression, prediction is decompression',
  },
];

export function AISuperIntelligenceViz() {
  const [selected, setSelected] = useState('intelligence');

  const concept = CONCEPTS.find(c => c.id === selected)!;

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Machine Super Intelligence</h3>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap justify-center">
        {CONCEPTS.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`px-3 py-1 text-xs rounded-md border ${
              selected === c.id
                ? 'border-accent text-accent bg-accent/10'
                : 'border-border text-text-secondary'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <motion.div
        key={selected}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg rounded-lg border border-border p-4 mb-6"
      >
        <div className="text-sm font-medium mb-2">{concept.name}</div>
        <div className="font-mono text-sm bg-bg-secondary p-3 rounded mb-3 text-accent overflow-x-auto">
          {concept.formula}
        </div>
        <div className="text-xs text-text-secondary">{concept.description}</div>
      </motion.div>

      <div className="relative bg-bg rounded-lg border border-border p-4 mb-4">
        <div className="text-sm font-medium mb-4 text-center">Intelligence Hierarchy</div>
        <div className="flex justify-center items-end gap-4">
          {[
            { label: 'Narrow AI', height: 40, color: 'rgb(75, 85, 99)' },
            { label: 'Human', height: 70, color: 'rgb(99, 102, 241)' },
            { label: 'AGI', height: 90, color: 'rgb(34, 197, 94)' },
            { label: 'AIXI', height: 120, color: 'rgb(249, 115, 22)' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <motion.div
                className="w-16 rounded-t"
                style={{ height: item.height, backgroundColor: item.color }}
                initial={{ height: 0 }}
                animate={{ height: item.height }}
                transition={{ delay: i * 0.1 }}
              />
              <div className="text-xs text-text-secondary mt-2">{item.label}</div>
            </div>
          ))}
        </div>
        <div className="text-xs text-text-secondary text-center mt-4">
          AIXI is theoretically optimal but incomputable
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">Key Insight</div>
          <div className="text-xs text-text-secondary">
            Intelligence can be formalized as the ability to achieve goals across
            a wide range of environments.
          </div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">Practical Limit</div>
          <div className="text-xs text-text-secondary">
            AIXI requires solving the halting problem—real systems must approximate.
          </div>
        </div>
      </div>
    </div>
  );
}
