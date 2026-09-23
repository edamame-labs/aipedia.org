import { useState } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

const IMAGES = [
  { id: 1, label: 'Cat', emoji: '🐱' },
  { id: 2, label: 'Dog', emoji: '🐕' },
  { id: 3, label: 'Car', emoji: '🚗' },
  { id: 4, label: 'Tree', emoji: '🌲' },
];

const TEXTS = [
  'a photo of a cat',
  'a photo of a dog',
  'a photo of a car',
  'a photo of a tree',
];

// Pre-computed similarity matrix (diagonal should be highest)
const SIMILARITIES = [
  [0.92, 0.35, 0.12, 0.18],
  [0.38, 0.89, 0.15, 0.21],
  [0.11, 0.14, 0.94, 0.08],
  [0.22, 0.19, 0.07, 0.91],
];

export function CLIPViz() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState<number | null>(null);

  const getHighlight = (imgIdx: number, txtIdx: number) => {
    if (selectedImage === imgIdx && selectedText === txtIdx) return 'ring-2 ring-accent';
    if (selectedImage === imgIdx || selectedText === txtIdx) return 'ring-1 ring-accent/50';
    return '';
  };

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">CLIP: Image-Text Matching</h3>
      </div>

      <p className="text-sm text-text-secondary mb-4">
        Click an image or text to see similarity scores. CLIP learns to maximize diagonal (matching pairs).
      </p>

      <div className="flex gap-6">
        <div className="flex flex-col gap-2">
          <div className="text-xs text-text-secondary mb-1">Images</div>
          {IMAGES.map((img, i) => (
            <motion.button
              key={img.id}
              className={`w-16 h-16 rounded-lg border flex items-center justify-center text-2xl ${
                selectedImage === i ? 'border-accent bg-accent/10' : 'border-border bg-bg'
              }`}
              onClick={() => setSelectedImage(selectedImage === i ? null : i)}
              whileHover={{ scale: 1.05 }}
            >
              {img.emoji}
            </motion.button>
          ))}
        </div>

        <div className="flex-1">
          <div className="text-xs text-text-secondary mb-1">Similarity Matrix</div>
          <div className="grid grid-cols-4 gap-1">
            {SIMILARITIES.map((row, i) =>
              row.map((sim, j) => {
                const isDiagonal = i === j;
                const isHighlighted = selectedImage === i || selectedText === j;
                return (
                  <motion.div
                    key={`${i}-${j}`}
                    className={`aspect-square rounded flex items-center justify-center text-xs font-mono ${getHighlight(i, j)}`}
                    style={{
                      background: isDiagonal
                        ? `rgba(34,197,94,${sim})`
                        : `rgba(99,102,241,${sim * 0.8})`,
                    }}
                    animate={{ scale: isHighlighted ? 1.1 : 1 }}
                  >
                    {sim.toFixed(2)}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-xs text-text-secondary mb-1">Text Prompts</div>
          {TEXTS.map((text, i) => (
            <motion.button
              key={i}
              className={`px-3 py-2 rounded-lg border text-left text-xs ${
                selectedText === i ? 'border-accent bg-accent/10' : 'border-border bg-bg'
              }`}
              onClick={() => setSelectedText(selectedText === i ? null : i)}
              whileHover={{ scale: 1.02 }}
            >
              {text}
            </motion.button>
          ))}
        </div>
      </div>

      {selectedImage !== null && (
        <div className="mt-4 p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm">
            <span className="text-accent font-medium">{IMAGES[selectedImage].emoji} {IMAGES[selectedImage].label}</span>
            <span className="text-text-secondary"> matches best with: </span>
            <span className="font-medium">"{TEXTS[selectedImage]}"</span>
            <span className="text-text-secondary"> (similarity: </span>
            <span className="text-green-500 font-mono">{SIMILARITIES[selectedImage][selectedImage].toFixed(2)}</span>
            <span className="text-text-secondary">)</span>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-bg rounded-lg border border-border">
        <p className="text-xs text-text-secondary">
          <span className="text-accent font-medium">Zero-shot:</span> To classify a new image, compute similarity with text prompts like "a photo of a {'{class}'}" and pick the highest.
        </p>
      </div>
    </div>
  );
}
