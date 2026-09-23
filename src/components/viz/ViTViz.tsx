import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';
import { createRng } from '../../lib/rng';

const PATCH_GRID = 4;
const TOTAL_PATCHES = PATCH_GRID * PATCH_GRID;

function generateAttention(size: number): number[][] {
  const random = createRng(21809);
  const matrix: number[][] = [];
  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    let sum = 0;
    for (let j = 0; j < size; j++) {
      const v = random();
      row.push(v);
      sum += v;
    }
    matrix.push(row.map(v => v / sum));
  }
  return matrix;
}

export function ViTViz() {
  const [selectedPatch, setSelectedPatch] = useState<number | null>(null);
  const [showCLS, setShowCLS] = useState(true);

  const attention = useMemo(() => generateAttention(TOTAL_PATCHES + 1), []);
  const patchSize = 48;
  const gap = 4;

  const clsAttention = attention[0];

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Vision Transformer Patches</h3>
        <button
          onClick={() => setShowCLS(!showCLS)}
          className="px-3 py-1 text-xs rounded-md bg-bg border border-border hover:border-accent"
        >
          {showCLS ? 'Hide' : 'Show'} [CLS] Attention
        </button>
      </div>

      <p className="text-sm text-text-secondary mb-4">
        ViT splits an image into {PATCH_GRID}×{PATCH_GRID} = {TOTAL_PATCHES} patches. Click a patch to see its attention.
      </p>

      <div className="flex gap-8 items-start">
        <div>
          <div className="text-xs text-text-secondary mb-2">Image Patches</div>
          <div
            className="grid border border-border rounded-lg overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${PATCH_GRID}, ${patchSize}px)`,
              gap: `${gap}px`,
              padding: `${gap}px`,
              background: 'var(--bg)',
            }}
          >
            {Array.from({ length: TOTAL_PATCHES }).map((_, i) => {
              const row = Math.floor(i / PATCH_GRID);
              const col = i % PATCH_GRID;
              const brightness = 0.3 + (row + col) * 0.1;
              const isSelected = selectedPatch === i;
              const clsWeight = showCLS ? clsAttention[i + 1] : 0;

              return (
                <motion.div
                  key={i}
                  className="cursor-pointer relative"
                  style={{
                    width: patchSize,
                    height: patchSize,
                    background: `rgba(99,102,241,${brightness})`,
                    borderRadius: 4,
                  }}
                  animate={{
                    scale: isSelected ? 1.1 : 1,
                    boxShadow: isSelected ? '0 0 0 2px var(--accent)' : 'none',
                  }}
                  onClick={() => setSelectedPatch(i === selectedPatch ? null : i)}
                >
                  {showCLS && (
                    <div
                      className="absolute inset-0 rounded"
                      style={{
                        background: `rgba(34,197,94,${clsWeight * 2})`,
                      }}
                    />
                  )}
                  <span className="absolute bottom-1 right-1 text-xs text-white/70">{i + 1}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex-1">
          <div className="text-xs text-text-secondary mb-2">[CLS] Token</div>
          <motion.div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-sm font-medium"
            style={{ background: 'rgba(34,197,94,0.3)', border: '2px solid rgba(34,197,94,0.6)' }}
            animate={{ scale: showCLS ? 1.1 : 1 }}
          >
            CLS
          </motion.div>

          {selectedPatch !== null && (
            <div className="mt-4 p-3 bg-bg rounded-lg border border-border">
              <div className="text-xs text-text-secondary mb-2">
                Patch {selectedPatch + 1} attention weights:
              </div>
              <div className="flex gap-1 flex-wrap">
                {attention[selectedPatch + 1].slice(1).map((w, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded text-xs flex items-center justify-center"
                    style={{ background: `rgba(99,102,241,${w * 2})` }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 p-3 bg-bg rounded-lg border border-border">
        <p className="text-xs text-text-secondary">
          <span className="text-accent font-medium">Process:</span> Patches → Linear projection → + Position embeddings → Transformer → [CLS] output → Classification
        </p>
      </div>
    </div>
  );
}
