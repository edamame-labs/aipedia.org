import { useState } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

interface StringExample {
  value: string;
  description: string;
  complexity: 'low' | 'medium' | 'high';
  program: string;
}

const EXAMPLES: StringExample[] = [
  {
    value: '0000000000000000',
    description: '16 zeros',
    complexity: 'low',
    program: 'print("0" * 16)',
  },
  {
    value: '0101010101010101',
    description: 'Alternating pattern',
    complexity: 'low',
    program: 'print("01" * 8)',
  },
  {
    value: '0110100110010110',
    description: 'Thue-Morse sequence',
    complexity: 'medium',
    program: 'thue_morse(16)',
  },
  {
    value: '1001011001110100',
    description: 'Pseudorandom (π bits)',
    complexity: 'medium',
    program: 'pi_bits(16)',
  },
  {
    value: '1011001110100010',
    description: 'Random string',
    complexity: 'high',
    program: '// No short program exists',
  },
];

export function KolmogorovViz() {
  const [selected, setSelected] = useState(0);

  const example = EXAMPLES[selected];

  const getComplexityColor = (c: string) => {
    switch (c) {
      case 'low': return 'rgb(34, 197, 94)';
      case 'medium': return 'rgb(249, 115, 22)';
      case 'high': return 'rgb(239, 68, 68)';
      default: return 'rgb(156, 163, 175)';
    }
  };

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Kolmogorov Complexity</h3>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`px-3 py-1 text-xs rounded-md border ${
              selected === i
                ? 'border-accent text-accent bg-accent/10'
                : 'border-border text-text-secondary'
            }`}
          >
            {ex.description}
          </button>
        ))}
      </div>

      <div className="bg-bg rounded-lg border border-border p-4 mb-4">
        <div className="text-xs text-text-secondary mb-2">String:</div>
        <div className="font-mono text-lg tracking-wider flex flex-wrap">
          {example.value.split('').map((char, i) => (
            <motion.span
              key={i}
              className={char === '1' ? 'text-accent' : 'text-text-secondary'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              {char}
            </motion.span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-xs text-text-secondary mb-1">Shortest Program</div>
          <pre className="text-xs font-mono text-green-400 bg-bg-secondary p-2 rounded">
            {example.program}
          </pre>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-xs text-text-secondary mb-1">Complexity</div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getComplexityColor(example.complexity) }}
            />
            <span className="text-sm font-medium capitalize">{example.complexity}</span>
          </div>
          <div className="text-xs text-text-secondary mt-1">
            K(x) ≈ {example.complexity === 'low' ? 'O(log n)' : example.complexity === 'medium' ? 'O(√n)' : 'n'}
          </div>
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4 mb-4">
        <div className="text-sm font-medium mb-2">Definition</div>
        <div className="font-mono text-xs bg-bg-secondary p-2 rounded mb-2">
          K(x) = min {'{'} |p| : U(p) = x {'}'}
        </div>
        <div className="text-xs text-text-secondary">
          The Kolmogorov complexity of a string x is the length of the shortest program p
          that outputs x on a universal Turing machine U.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">Incompressible Strings</div>
          <div className="text-xs text-text-secondary">
            Most strings have K(x) ≈ |x|. They're random—no pattern to exploit.
          </div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">Uncomputability</div>
          <div className="text-xs text-text-secondary">
            K(x) is uncomputable! No algorithm can find the shortest program for all x.
          </div>
        </div>
      </div>
    </div>
  );
}
