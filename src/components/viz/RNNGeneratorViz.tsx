import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

const SAMPLES = {
  shakespeare: {
    seed: 'KING:',
    generated: `KING:
What say you to this? my lord of Canterbury?
Cannot your grace be got to speak with her?

QUEEN ELIZABETH:
Marry, lord, I think it be no other but so;
My lord, I shall be glad to hear such news.`,
  },
  code: {
    seed: 'static void',
    generated: `static void init_device(struct device *dev)
{
    if (dev->state != DEVICE_STATE_INIT) {
        dev->flags |= DEVICE_FLAG_ERROR;
        return;
    }
    dev->state = DEVICE_STATE_READY;
}`,
  },
  latex: {
    seed: '\\begin{theorem}',
    generated: `\\begin{theorem}
Let $G$ be a finite group and $H \\leq G$ a subgroup.
Then $|H|$ divides $|G|$.
\\end{theorem}

\\begin{proof}
Consider the cosets of $H$ in $G$...
\\end{proof}`,
  },
};

type SampleKey = keyof typeof SAMPLES;

export function RNNGeneratorViz() {
  const [selectedSample, setSelectedSample] = useState<SampleKey>('shakespeare');
  const [charIndex, setCharIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const sample = SAMPLES[selectedSample];
  const displayedText = sample.generated.slice(0, charIndex);
  
  const generate = useCallback(() => {
    setCharIndex(0);
    setIsGenerating(true);
    
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setCharIndex(i);
      if (i >= sample.generated.length) {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 20);
    
    return () => clearInterval(interval);
  }, [sample]);

  const selectSample = (key: SampleKey) => {
    setSelectedSample(key);
    setCharIndex(0);
    setIsGenerating(false);
  };

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Character-Level RNN Generation</h3>
        <a
          href="https://karpathy.github.io/2015/05/21/rnn-effectiveness/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent hover:underline"
        >
          Original post →
        </a>
      </div>

      <div className="flex gap-2 mb-4">
        {(Object.keys(SAMPLES) as SampleKey[]).map((key) => (
          <button
            key={key}
            onClick={() => selectSample(key)}
            className={`px-3 py-1 text-xs rounded-md border capitalize ${
              selectedSample === key
                ? 'border-accent text-accent bg-accent/10'
                : 'border-border text-text-secondary'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="bg-[#1a1a2e] rounded-lg p-4 mb-4 font-mono text-sm min-h-[200px]">
        <div className="text-text-secondary mb-2">
          Seed: <span className="text-green-400">{sample.seed}</span>
        </div>
        <div className="text-green-400 whitespace-pre-wrap">
          {displayedText}
          {isGenerating && (
            <motion.span
              className="inline-block w-2 h-4 bg-green-400 ml-0.5"
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            />
          )}
        </div>
      </div>

      <button
        onClick={generate}
        disabled={isGenerating}
        className="w-full py-2 text-sm rounded-md border border-accent text-accent hover:bg-accent/10 disabled:opacity-50"
      >
        {isGenerating ? 'Generating...' : 'Generate Text'}
      </button>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">How It Works</div>
          <div className="text-xs text-text-secondary">
            RNN predicts next character given all previous characters. 
            Hidden state encodes the context.
          </div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-1">Temperature</div>
          <div className="text-xs text-text-secondary">
            Low temp → conservative, repetitive. 
            High temp → creative, potentially chaotic.
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-accent/10 to-transparent rounded-lg border border-accent/30">
        <div className="text-sm font-medium text-accent mb-1">The Magic</div>
        <div className="text-xs text-text-secondary">
          With just characters as input, RNNs learn spelling, grammar, code syntax, 
          even LaTeX mathematics—all emerging from next-character prediction.
        </div>
      </div>
    </div>
  );
}
