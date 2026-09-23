import { useState } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';
import { createRng } from '../../lib/rng';

const SPECTROGRAM_HEIGHT = 80;
const SPECTROGRAM_WIDTH = 200;

function generateSpectrogram(): number[][] {
  const random = createRng(81149);
  const data: number[][] = [];
  for (let i = 0; i < 40; i++) {
    const row: number[] = [];
    for (let j = 0; j < 100; j++) {
      const freq = Math.sin(j * 0.1 + i * 0.2) * 0.3;
      const energy = Math.exp(-((i - 20) ** 2) / 200) * Math.exp(-((j % 25 - 12) ** 2) / 50);
      row.push(Math.max(0, Math.min(1, freq + energy + random() * 0.2)));
    }
    data.push(row);
  }
  return data;
}

export function DeepSpeechViz() {
  const [step, setStep] = useState<'input' | 'rnn' | 'ctc' | 'output'>('input');
  const [spectrogram] = useState(() => generateSpectrogram());

  const steps = [
    { id: 'input' as const, label: 'Spectrogram' },
    { id: 'rnn' as const, label: 'Bidirectional RNN' },
    { id: 'ctc' as const, label: 'CTC Loss' },
    { id: 'output' as const, label: 'Transcription' },
  ];

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Deep Speech 2</h3>
      </div>

      <div className="flex gap-2 mb-6 justify-center">
        {steps.map((s) => (
          <button
            key={s.id}
            onClick={() => setStep(s.id)}
            className={`px-3 py-1 text-xs rounded-md border ${
              step === s.id
                ? 'border-accent text-accent bg-accent/10'
                : 'border-border text-text-secondary'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="bg-bg rounded-lg border border-border p-4 mb-4">
        {step === 'input' && (
          <div>
            <div className="text-xs text-text-secondary mb-2">Input Spectrogram</div>
            <svg width={SPECTROGRAM_WIDTH} height={SPECTROGRAM_HEIGHT} className="w-full">
              {spectrogram.map((row, i) =>
                row.map((val, j) => (
                  <rect
                    key={`${i}-${j}`}
                    x={j * 2}
                    y={i * 2}
                    width={2}
                    height={2}
                    fill={`rgba(99, 102, 241, ${val})`}
                  />
                ))
              )}
            </svg>
            <div className="flex justify-between text-xs text-text-secondary mt-2">
              <span>Time →</span>
              <span>↑ Frequency</span>
            </div>
          </div>
        )}

        {step === 'rnn' && (
          <div className="text-center py-4">
            <div className="flex justify-center gap-8 mb-4">
              {['→', '→', '→'].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  h{i + 1}
                </motion.div>
              ))}
            </div>
            <div className="text-xs text-text-secondary">Forward LSTM</div>
            <div className="flex justify-center gap-8 mt-4">
              {['←', '←', '←'].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                >
                  h{i + 1}
                </motion.div>
              ))}
            </div>
            <div className="text-xs text-text-secondary mt-2">Backward LSTM</div>
          </div>
        )}

        {step === 'ctc' && (
          <div className="text-center py-4">
            <div className="font-mono text-sm mb-4">
              <span className="text-accent">h-</span>
              <span className="text-green-500">e-</span>
              <span className="text-accent">l-</span>
              <span className="text-text-secondary">ε-</span>
              <span className="text-accent">l-</span>
              <span className="text-green-500">o-</span>
              <span className="text-text-secondary">ε</span>
            </div>
            <div className="text-xs text-text-secondary mb-4">
              CTC allows variable-length alignment with blank tokens (ε)
            </div>
            <div className="text-sm">
              <span className="text-text-secondary">Output: </span>
              <span className="text-accent font-medium">hello</span>
            </div>
          </div>
        )}

        {step === 'output' && (
          <div className="text-center py-8">
            <motion.div
              className="text-2xl font-medium text-accent"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              "Hello world"
            </motion.div>
            <div className="text-xs text-text-secondary mt-4">
              End-to-end: raw audio → text transcription
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">Batch Normalization</div>
          <div className="text-xs text-text-secondary">
            Applied to RNN activations, enabling deeper networks
          </div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">SortaGrad</div>
          <div className="text-xs text-text-secondary">
            Curriculum learning: start with shorter utterances
          </div>
        </div>
      </div>
    </div>
  );
}
