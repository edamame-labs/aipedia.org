import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../lib/motion';

const SOURCE = ['The', 'cat', 'sat', '<EOS>'];
const TARGET = ['<SOS>', 'Le', 'chat', 'assis', '<EOS>'];

type Phase = 'idle' | 'encoding' | 'context' | 'decoding' | 'done';

export function Seq2SeqViz() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [encoderStep, setEncoderStep] = useState(-1);
  const [decoderStep, setDecoderStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const sequence = async () => {
      // Encoding phase
      setPhase('encoding');
      for (let i = 0; i < SOURCE.length; i++) {
        setEncoderStep(i);
        await new Promise((r) => setTimeout(r, 600));
      }

      // Context vector phase
      setPhase('context');
      await new Promise((r) => setTimeout(r, 800));

      // Decoding phase
      setPhase('decoding');
      for (let i = 0; i < TARGET.length; i++) {
        setDecoderStep(i);
        await new Promise((r) => setTimeout(r, 600));
      }

      setPhase('done');
      setIsRunning(false);
    };

    sequence();
  }, [isRunning]);

  const reset = () => {
    setPhase('idle');
    setEncoderStep(-1);
    setDecoderStep(-1);
    setIsRunning(false);
  };

  const start = () => {
    reset();
    setTimeout(() => setIsRunning(true), 100);
  };

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Seq2Seq: Encoder-Decoder</h3>
        <div className="flex gap-2">
          <button
            onClick={start}
            disabled={isRunning}
            className="px-3 py-1 text-xs rounded-md border border-accent text-accent hover:bg-accent/10 disabled:opacity-50"
          >
            {phase === 'idle' ? 'Start' : 'Restart'}
          </button>
          <button
            onClick={reset}
            className="px-3 py-1 text-xs rounded-md border border-border text-text-secondary hover:border-accent"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Phase indicator */}
      <div className="flex justify-center gap-2 mb-6">
        {(['encoding', 'context', 'decoding'] as Phase[]).map((p) => (
          <div
            key={p}
            className={`px-3 py-1 text-xs rounded-full border ${
              phase === p || (phase === 'done' && p === 'decoding')
                ? 'border-accent text-accent bg-accent/10'
                : phase === 'done' || (phase === 'decoding' && p === 'encoding') || (phase === 'decoding' && p === 'context')
                ? 'border-green-500/50 text-green-500'
                : 'border-border text-text-secondary'
            }`}
          >
            {p === 'encoding' ? '1. Encode' : p === 'context' ? '2. Context' : '3. Decode'}
          </div>
        ))}
      </div>

      {/* Main visualization */}
      <div className="bg-bg rounded-lg border border-border p-4">
        <div className="flex items-start justify-between">
          {/* Encoder */}
          <div className="flex-1">
            <div className="text-xs text-text-secondary mb-2 text-center">Encoder (LSTM)</div>
            <div className="flex flex-col items-center gap-2">
              {SOURCE.map((token, i) => (
                <motion.div
                  key={i}
                  className={`flex items-center gap-2 ${
                    encoderStep >= i ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded border text-sm font-mono ${
                      encoderStep === i
                        ? 'border-accent bg-accent/20 text-accent'
                        : 'border-border bg-bg-secondary'
                    }`}
                  >
                    {token}
                  </div>
                  <motion.div
                    className="text-accent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: encoderStep >= i ? 1 : 0 }}
                  >
                    →
                  </motion.div>
                  <motion.div
                    className={`w-10 h-10 rounded border flex items-center justify-center text-xs ${
                      encoderStep >= i
                        ? 'border-green-500 bg-green-500/20 text-green-400'
                        : 'border-border'
                    }`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: encoderStep >= i ? 1 : 0.8 }}
                  >
                    h{i + 1}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Context vector */}
          <div className="flex flex-col items-center mx-8">
            <div className="text-xs text-text-secondary mb-2">Context</div>
            <AnimatePresence>
              {(phase === 'context' || phase === 'decoding' || phase === 'done') && (
                <motion.div
                  className="relative"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <div className="w-16 h-24 rounded-lg border-2 border-yellow-500 bg-yellow-500/20 flex items-center justify-center">
                    <span className="text-yellow-400 font-bold">c</span>
                  </div>
                  <motion.div
                    className="absolute -right-8 top-1/2 -translate-y-1/2 text-yellow-400"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: phase === 'decoding' ? Infinity : 0 }}
                  >
                    →
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="text-xs text-text-secondary mt-2 text-center max-w-20">
              "Thought Vector"
            </div>
          </div>

          {/* Decoder */}
          <div className="flex-1">
            <div className="text-xs text-text-secondary mb-2 text-center">Decoder (LSTM)</div>
            <div className="flex flex-col items-center gap-2">
              {TARGET.map((token, i) => (
                <motion.div
                  key={i}
                  className={`flex items-center gap-2 ${
                    decoderStep >= i ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  <motion.div
                    className={`w-10 h-10 rounded border flex items-center justify-center text-xs ${
                      decoderStep >= i
                        ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                        : 'border-border'
                    }`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: decoderStep >= i ? 1 : 0.8 }}
                  >
                    s{i + 1}
                  </motion.div>
                  <motion.div
                    className="text-accent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: decoderStep >= i ? 1 : 0 }}
                  >
                    →
                  </motion.div>
                  <div
                    className={`px-3 py-2 rounded border text-sm font-mono ${
                      decoderStep === i
                        ? 'border-accent bg-accent/20 text-accent'
                        : decoderStep > i
                        ? 'border-green-500 bg-green-500/20 text-green-400'
                        : 'border-border bg-bg-secondary'
                    }`}
                  >
                    {token}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-4 p-4 bg-bg rounded-lg border border-border text-sm">
        {phase === 'idle' && (
          <span>
            Press "Start" to see how Seq2Seq translates "The cat sat" to "Le chat assis".
          </span>
        )}
        {phase === 'encoding' && (
          <span>
            <strong className="text-green-400">Encoding:</strong> The encoder LSTM processes
            each input token, updating its hidden state h. The final state captures the
            meaning of the entire sentence.
          </span>
        )}
        {phase === 'context' && (
          <span>
            <strong className="text-yellow-400">Context Vector:</strong> The encoder's final
            hidden state becomes the context vector c — a fixed-size representation of the
            input sequence.
          </span>
        )}
        {phase === 'decoding' && (
          <span>
            <strong className="text-purple-400">Decoding:</strong> The decoder LSTM generates
            the output sequence one token at a time, initialized with the context vector.
            Each step conditions on the previous output.
          </span>
        )}
        {phase === 'done' && (
          <span className="text-accent">
            <strong>Complete!</strong> The model translated "The cat sat" → "Le chat assis"
            by compressing the input into a context vector, then generating the output
            autoregressively.
          </span>
        )}
      </div>

      {/* Architecture note */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="font-medium mb-1">Input Processing</div>
          <div className="text-text-secondary">
            Often reversed ("sat cat The") to reduce distance between corresponding words
          </div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="font-medium mb-1">The Bottleneck</div>
          <div className="text-text-secondary">
            Fixed-size context limits long sequences → Led to attention mechanisms
          </div>
        </div>
      </div>
    </div>
  );
}
