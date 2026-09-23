import { useState } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

// Simulated 2D word embeddings (t-SNE projected)
const WORDS: { word: string; x: number; y: number; category: string }[] = [
  // Royalty
  { word: 'king', x: 280, y: 60, category: 'royalty' },
  { word: 'queen', x: 320, y: 100, category: 'royalty' },
  { word: 'prince', x: 260, y: 100, category: 'royalty' },
  { word: 'princess', x: 300, y: 140, category: 'royalty' },
  // Gender
  { word: 'man', x: 80, y: 70, category: 'gender' },
  { word: 'woman', x: 120, y: 110, category: 'gender' },
  { word: 'boy', x: 60, y: 110, category: 'gender' },
  { word: 'girl', x: 100, y: 150, category: 'gender' },
  // Animals
  { word: 'cat', x: 180, y: 220, category: 'animal' },
  { word: 'dog', x: 220, y: 200, category: 'animal' },
  { word: 'kitten', x: 160, y: 260, category: 'animal' },
  { word: 'puppy', x: 200, y: 240, category: 'animal' },
  // Countries/Capitals
  { word: 'paris', x: 350, y: 220, category: 'place' },
  { word: 'france', x: 380, y: 260, category: 'place' },
  { word: 'tokyo', x: 320, y: 260, category: 'place' },
  { word: 'japan', x: 350, y: 300, category: 'place' },
];

const ANALOGIES = [
  { a: 'king', b: 'man', c: 'woman', result: 'queen', description: 'king - man + woman = queen' },
  { a: 'paris', b: 'france', c: 'japan', result: 'tokyo', description: 'paris - france + japan = tokyo' },
  { a: 'cat', b: 'kitten', c: 'puppy', result: 'dog', description: 'cat - kitten + puppy = dog' },
];

const CATEGORY_COLORS: Record<string, string> = {
  royalty: 'rgb(147, 51, 234)', // purple
  gender: 'rgb(59, 130, 246)', // blue
  animal: 'rgb(34, 197, 94)', // green
  place: 'rgb(249, 115, 22)', // orange
};

export function Word2VecViz() {
  const [selectedAnalogy, setSelectedAnalogy] = useState(0);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [showVectors, setShowVectors] = useState(false);

  const analogy = ANALOGIES[selectedAnalogy];
  const getWord = (w: string) => WORDS.find((word) => word.word === w)!;

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Word2Vec: Word Embeddings</h3>
        <button
          onClick={() => setShowVectors(!showVectors)}
          className={`px-3 py-1 text-xs rounded-md border transition-colors ${
            showVectors
              ? 'border-accent text-accent bg-accent/10'
              : 'border-border text-text-secondary hover:border-accent/50'
          }`}
        >
          {showVectors ? 'Hide' : 'Show'} Vectors
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-text-secondary capitalize">{cat}</span>
          </div>
        ))}
      </div>

      {/* 2D Embedding space */}
      <div className="relative mb-6 bg-bg rounded-lg border border-border">
        <svg className="w-full h-80">
          {/* Vector arithmetic visualization */}
          {showVectors && (
            <>
              {/* a to b vector */}
              <motion.line
                x1={getWord(analogy.a).x}
                y1={getWord(analogy.a).y}
                x2={getWord(analogy.b).x}
                y2={getWord(analogy.b).y}
                stroke="rgb(239, 68, 68)"
                strokeWidth="2"
                strokeDasharray="4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
              {/* c to result vector (parallel) */}
              <motion.line
                x1={getWord(analogy.c).x}
                y1={getWord(analogy.c).y}
                x2={getWord(analogy.result).x}
                y2={getWord(analogy.result).y}
                stroke="rgb(34, 197, 94)"
                strokeWidth="2"
                strokeDasharray="4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.3 }}
              />
              {/* b to c vector */}
              <motion.line
                x1={getWord(analogy.b).x}
                y1={getWord(analogy.b).y}
                x2={getWord(analogy.c).x}
                y2={getWord(analogy.c).y}
                stroke="rgb(99, 102, 241)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.15 }}
              />
              {/* a to result vector */}
              <motion.line
                x1={getWord(analogy.a).x}
                y1={getWord(analogy.a).y}
                x2={getWord(analogy.result).x}
                y2={getWord(analogy.result).y}
                stroke="rgb(99, 102, 241)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.45 }}
              />
            </>
          )}

          {/* Word points */}
          {WORDS.map((word) => {
            const isAnalogy = [analogy.a, analogy.b, analogy.c, analogy.result].includes(word.word);
            return (
              <g key={word.word}>
                <motion.circle
                  cx={word.x}
                  cy={word.y}
                  r={isAnalogy ? 8 : 6}
                  fill={CATEGORY_COLORS[word.category]}
                  opacity={hoveredWord === word.word || isAnalogy ? 1 : 0.6}
                  onMouseEnter={() => setHoveredWord(word.word)}
                  onMouseLeave={() => setHoveredWord(null)}
                  style={{ cursor: 'pointer' }}
                  animate={{
                    scale: hoveredWord === word.word ? 1.3 : 1,
                  }}
                />
                <text
                  x={word.x}
                  y={word.y - 12}
                  textAnchor="middle"
                  className="text-xs fill-current text-text-primary"
                  style={{ pointerEvents: 'none' }}
                >
                  {word.word}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Analogy selector */}
      <div className="mb-4">
        <div className="text-sm text-text-secondary mb-2">Vector Analogies:</div>
        <div className="flex gap-2">
          {ANALOGIES.map((a, i) => (
            <button
              key={i}
              onClick={() => setSelectedAnalogy(i)}
              className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                selectedAnalogy === i
                  ? 'border-accent text-accent bg-accent/10'
                  : 'border-border text-text-secondary hover:border-accent/50'
              }`}
            >
              {a.description}
            </button>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div className="p-4 bg-bg rounded-lg border border-border">
        <div className="text-sm mb-2">
          <strong>How it works:</strong>
        </div>
        <div className="text-sm text-text-secondary">
          The relationship between <span className="text-accent">{analogy.a}</span> and{' '}
          <span className="text-accent">{analogy.b}</span> is captured as a vector.
          Adding this same vector to <span className="text-accent">{analogy.c}</span> gives us{' '}
          <span className="text-accent">{analogy.result}</span>.
        </div>
        <div className="mt-3 p-2 bg-bg-secondary rounded font-mono text-sm text-center">
          vec({analogy.a}) - vec({analogy.b}) + vec({analogy.c}) ≈ vec({analogy.result})
        </div>
      </div>

      {/* Skip-gram illustration */}
      <div className="mt-4 p-4 bg-bg rounded-lg border border-border">
        <div className="text-sm font-medium mb-2">Skip-gram Training</div>
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-text-secondary">Context:</span>
          <span className="px-2 py-1 bg-bg-secondary rounded">the</span>
          <span className="px-2 py-1 bg-bg-secondary rounded">quick</span>
          <span className="px-2 py-1 bg-accent/20 text-accent rounded border border-accent">brown</span>
          <span className="px-2 py-1 bg-bg-secondary rounded">fox</span>
          <span className="px-2 py-1 bg-bg-secondary rounded">jumps</span>
        </div>
        <div className="text-xs text-text-secondary text-center mt-2">
          Given "brown", predict: "the", "quick", "fox", "jumps"
        </div>
      </div>
    </div>
  );
}
