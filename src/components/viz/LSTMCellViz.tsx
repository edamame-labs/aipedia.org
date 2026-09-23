import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

type Gate = 'forget' | 'input' | 'cell' | 'output' | null;

const GATE_INFO = {
  forget: {
    name: 'Forget Gate',
    formula: 'fₜ = σ(Wf·[hₜ₋₁, xₜ] + bf)',
    description: 'Decides what to throw away from cell state',
    color: 'rgb(239, 68, 68)',
  },
  input: {
    name: 'Input Gate',
    formula: 'iₜ = σ(Wi·[hₜ₋₁, xₜ] + bi)',
    description: 'Decides which values to update',
    color: 'rgb(34, 197, 94)',
  },
  cell: {
    name: 'Cell Candidate',
    formula: 'C̃ₜ = tanh(Wc·[hₜ₋₁, xₜ] + bc)',
    description: 'Creates new candidate values',
    color: 'rgb(99, 102, 241)',
  },
  output: {
    name: 'Output Gate',
    formula: 'oₜ = σ(Wo·[hₜ₋₁, xₜ] + bo)',
    description: 'Decides what to output',
    color: 'rgb(249, 115, 22)',
  },
};

export function LSTMCellViz() {
  const [activeGate, setActiveGate] = useState<Gate>(null);
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = ['forget', 'input', 'cell', 'output'] as const;

  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setStep((s) => {
          if (s >= 3) {
            setIsAnimating(false);
            return 0;
          }
          return s + 1;
        });
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  useEffect(() => {
    if (isAnimating) {
      setActiveGate(steps[step]);
    }
  }, [step, isAnimating]);

  const animate = () => {
    setStep(0);
    setActiveGate('forget');
    setIsAnimating(true);
  };

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">LSTM Cell</h3>
        <button
          onClick={animate}
          disabled={isAnimating}
          className="px-3 py-1 text-xs rounded-md border border-accent text-accent hover:bg-accent/10 disabled:opacity-50"
        >
          {isAnimating ? 'Animating...' : 'Animate Flow'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 justify-center flex-wrap">
        {(Object.keys(GATE_INFO) as Gate[]).filter(Boolean).map((gate) => (
          <button
            key={gate}
            onClick={() => { setActiveGate(gate); setIsAnimating(false); }}
            className={`px-3 py-1 text-xs rounded-md border ${
              activeGate === gate
                ? 'text-white'
                : 'border-border text-text-secondary'
            }`}
            style={{
              backgroundColor: activeGate === gate ? GATE_INFO[gate!].color : undefined,
              borderColor: activeGate === gate ? GATE_INFO[gate!].color : undefined,
            }}
          >
            {GATE_INFO[gate!].name}
          </button>
        ))}
      </div>

      <div className="relative bg-bg rounded-lg border border-border p-4 mb-4">
        <svg width="100%" height="200" viewBox="0 0 400 200">
          <motion.line
            x1="0" y1="40" x2="400" y2="40"
            stroke={activeGate ? 'rgb(99, 102, 241)' : 'rgb(75, 85, 99)'}
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
          />
          <text x="10" y="30" fill="rgb(156, 163, 175)" fontSize="12">Cell State (Cₜ₋₁ → Cₜ)</text>
          
          <motion.circle
            cx="80" cy="100"
            r="20"
            fill={activeGate === 'forget' ? GATE_INFO.forget.color : 'rgb(55, 65, 81)'}
            animate={{ scale: activeGate === 'forget' ? 1.1 : 1 }}
          />
          <text x="73" y="105" fill="white" fontSize="14">×</text>
          <text x="60" y="140" fill="rgb(156, 163, 175)" fontSize="10">Forget</text>
          
          <motion.circle
            cx="160" cy="100"
            r="20"
            fill={activeGate === 'input' ? GATE_INFO.input.color : 'rgb(55, 65, 81)'}
            animate={{ scale: activeGate === 'input' ? 1.1 : 1 }}
          />
          <text x="153" y="105" fill="white" fontSize="14">×</text>
          <text x="145" y="140" fill="rgb(156, 163, 175)" fontSize="10">Input</text>
          
          <motion.rect
            x="200" y="80"
            width="40" height="40"
            fill={activeGate === 'cell' ? GATE_INFO.cell.color : 'rgb(55, 65, 81)'}
            rx="4"
            animate={{ scale: activeGate === 'cell' ? 1.1 : 1 }}
          />
          <text x="207" y="105" fill="white" fontSize="12">tanh</text>
          <text x="200" y="140" fill="rgb(156, 163, 175)" fontSize="10">Cell</text>
          
          <motion.circle
            cx="280" cy="100"
            r="20"
            fill="rgb(55, 65, 81)"
            animate={{ scale: 1 }}
          />
          <text x="273" y="105" fill="white" fontSize="14">+</text>
          
          <motion.circle
            cx="340" cy="100"
            r="20"
            fill={activeGate === 'output' ? GATE_INFO.output.color : 'rgb(55, 65, 81)'}
            animate={{ scale: activeGate === 'output' ? 1.1 : 1 }}
          />
          <text x="333" y="105" fill="white" fontSize="14">×</text>
          <text x="323" y="140" fill="rgb(156, 163, 175)" fontSize="10">Output</text>
          
          <line x1="80" y1="80" x2="80" y2="50" stroke="rgb(75, 85, 99)" strokeWidth="2" />
          <line x1="280" y1="80" x2="280" y2="50" stroke="rgb(75, 85, 99)" strokeWidth="2" />
          
          <motion.line
            x1="0" y1="160" x2="400" y2="160"
            stroke="rgb(75, 85, 99)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <text x="10" y="180" fill="rgb(156, 163, 175)" fontSize="12">Hidden State (hₜ₋₁ → hₜ)</text>
        </svg>
      </div>

      {activeGate && (
        <motion.div
          key={activeGate}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg rounded-lg border p-4 mb-4"
          style={{ borderColor: GATE_INFO[activeGate].color }}
        >
          <div className="text-sm font-medium" style={{ color: GATE_INFO[activeGate].color }}>
            {GATE_INFO[activeGate].name}
          </div>
          <div className="font-mono text-xs my-2 bg-bg-secondary p-2 rounded">
            {GATE_INFO[activeGate].formula}
          </div>
          <div className="text-xs text-text-secondary">
            {GATE_INFO[activeGate].description}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">Cell State</div>
          <div className="text-xs text-text-secondary">
            The "memory highway"—information can flow unchanged across many timesteps
          </div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">Gates</div>
          <div className="text-xs text-text-secondary">
            Sigmoid (σ) outputs 0-1, controlling how much information passes through
          </div>
        </div>
      </div>
    </div>
  );
}
