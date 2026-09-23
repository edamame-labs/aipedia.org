import { useState } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

interface Shape {
  id: number;
  type: 'circle' | 'square' | 'triangle';
  color: string;
  x: number;
  y: number;
  size: number;
}

const SHAPES: Shape[] = [
  { id: 0, type: 'circle', color: 'rgb(239, 68, 68)', x: 50, y: 50, size: 25 },
  { id: 1, type: 'square', color: 'rgb(99, 102, 241)', x: 120, y: 80, size: 30 },
  { id: 2, type: 'circle', color: 'rgb(34, 197, 94)', x: 80, y: 130, size: 20 },
  { id: 3, type: 'triangle', color: 'rgb(249, 115, 22)', x: 150, y: 50, size: 25 },
];

const QUESTIONS = [
  { q: 'What color is the object nearest to the red circle?', a: 'Blue' },
  { q: 'How many circles are there?', a: '2' },
  { q: 'Is there a green square?', a: 'No' },
];

export function RelationalReasoningViz() {
  const [selectedPair, setSelectedPair] = useState<[number, number] | null>(null);
  const [questionIdx, setQuestionIdx] = useState(0);

  const renderShape = (shape: Shape) => {
    const props = {
      fill: shape.color,
      opacity: selectedPair && !selectedPair.includes(shape.id) ? 0.3 : 1,
    };

    switch (shape.type) {
      case 'circle':
        return <circle cx={shape.x} cy={shape.y} r={shape.size} {...props} />;
      case 'square':
        return (
          <rect
            x={shape.x - shape.size}
            y={shape.y - shape.size}
            width={shape.size * 2}
            height={shape.size * 2}
            {...props}
          />
        );
      case 'triangle':
        const points = `${shape.x},${shape.y - shape.size} ${shape.x - shape.size},${shape.y + shape.size} ${shape.x + shape.size},${shape.y + shape.size}`;
        return <polygon points={points} {...props} />;
    }
  };

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Relational Reasoning</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-bg rounded-lg border border-border p-2">
          <svg width="200" height="180" className="w-full">
            {selectedPair && (
              <motion.line
                x1={SHAPES[selectedPair[0]].x}
                y1={SHAPES[selectedPair[0]].y}
                x2={SHAPES[selectedPair[1]].x}
                y2={SHAPES[selectedPair[1]].y}
                stroke="rgb(249, 115, 22)"
                strokeWidth="2"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            )}
            {SHAPES.map((shape) => (
              <g key={shape.id}>{renderShape(shape)}</g>
            ))}
          </svg>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-text-secondary">Select object pair:</div>
          {SHAPES.slice(0, 3).map((s1, i) =>
            SHAPES.slice(i + 1).map((s2) => (
              <button
                key={`${s1.id}-${s2.id}`}
                onClick={() => setSelectedPair([s1.id, s2.id])}
                className={`px-2 py-1 text-xs rounded border mr-1 mb-1 ${
                  selectedPair?.[0] === s1.id && selectedPair?.[1] === s2.id
                    ? 'border-accent text-accent'
                    : 'border-border text-text-secondary'
                }`}
              >
                {s1.type[0]}-{s2.type[0]}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Visual QA</span>
          <button
            onClick={() => setQuestionIdx((i) => (i + 1) % QUESTIONS.length)}
            className="text-xs text-accent hover:underline"
          >
            Next question →
          </button>
        </div>
        <div className="text-sm mb-2">{QUESTIONS[questionIdx].q}</div>
        <div className="text-sm text-accent">Answer: {QUESTIONS[questionIdx].a}</div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4">
        <div className="text-sm font-medium mb-2">Relation Network Formula</div>
        <div className="font-mono text-xs bg-bg-secondary p-2 rounded mb-2">
          RN(O) = f<sub>φ</sub>(Σ<sub>i,j</sub> g<sub>θ</sub>(o<sub>i</sub>, o<sub>j</sub>))
        </div>
        <div className="text-xs text-text-secondary">
          Consider all pairs of objects, process each pair with g, aggregate with f.
        </div>
      </div>
    </div>
  );
}
