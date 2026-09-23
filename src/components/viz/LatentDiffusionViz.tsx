import { useState } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

export function LatentDiffusionViz() {
  const [stage, setStage] = useState<'pixel' | 'encode' | 'diffuse' | 'decode'>('pixel');

  const stages = [
    { id: 'pixel', label: 'Pixel Space', size: '512×512×3', dims: '786,432' },
    { id: 'encode', label: 'Encode', size: '→', dims: '' },
    { id: 'diffuse', label: 'Latent Space', size: '64×64×4', dims: '16,384' },
    { id: 'decode', label: 'Decode', size: '→ 512×512', dims: '' },
  ];

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Latent Diffusion Pipeline</h3>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {stages.map((s, i) => (
          <motion.button
            key={s.id}
            onClick={() => setStage(s.id as typeof stage)}
            className={`px-3 py-2 rounded-lg border text-center min-w-[100px] ${
              stage === s.id ? 'border-accent bg-accent/10' : 'border-border'
            }`}
            animate={{ scale: stage === s.id ? 1.05 : 1 }}
          >
            <div className="text-xs font-medium">{s.label}</div>
            {s.size && <div className="text-xs text-text-secondary">{s.size}</div>}
          </motion.button>
        ))}
      </div>

      <div className="flex justify-center items-center gap-4 mb-6">
        {/* Pixel space representation */}
        <motion.div
          className="border border-border rounded-lg flex items-center justify-center"
          style={{
            width: 120,
            height: 120,
            background: stage === 'pixel' ? 'rgba(99,102,241,0.2)' : 'var(--bg)',
          }}
          animate={{ opacity: stage === 'pixel' ? 1 : 0.5 }}
        >
          <div className="text-center">
            <div className="text-2xl mb-1">🖼️</div>
            <div className="text-xs text-text-secondary">512×512</div>
            <div className="text-xs text-red-400">786k dims</div>
          </div>
        </motion.div>

        <div className="text-2xl text-text-secondary">→</div>

        {/* Encoder */}
        <motion.div
          className="border border-border rounded-lg p-3"
          style={{ background: stage === 'encode' ? 'rgba(99,102,241,0.2)' : 'var(--bg)' }}
          animate={{ scale: stage === 'encode' ? 1.1 : 1 }}
        >
          <div className="text-xs font-medium text-center">VAE</div>
          <div className="text-xs text-text-secondary">Encoder</div>
        </motion.div>

        <div className="text-2xl text-text-secondary">→</div>

        {/* Latent space */}
        <motion.div
          className="border border-border rounded-lg flex items-center justify-center"
          style={{
            width: 60,
            height: 60,
            background: stage === 'diffuse' ? 'rgba(34,197,94,0.3)' : 'var(--bg)',
          }}
          animate={{ opacity: stage === 'diffuse' ? 1 : 0.5, scale: stage === 'diffuse' ? 1.2 : 1 }}
        >
          <div className="text-center">
            <div className="text-xs text-text-secondary">64×64</div>
            <div className="text-xs text-green-500">16k dims</div>
          </div>
        </motion.div>

        <div className="text-2xl text-text-secondary">→</div>

        {/* Decoder */}
        <motion.div
          className="border border-border rounded-lg p-3"
          style={{ background: stage === 'decode' ? 'rgba(99,102,241,0.2)' : 'var(--bg)' }}
          animate={{ scale: stage === 'decode' ? 1.1 : 1 }}
        >
          <div className="text-xs font-medium text-center">VAE</div>
          <div className="text-xs text-text-secondary">Decoder</div>
        </motion.div>

        <div className="text-2xl text-text-secondary">→</div>

        {/* Output */}
        <motion.div
          className="border border-border rounded-lg flex items-center justify-center"
          style={{
            width: 120,
            height: 120,
            background: stage === 'decode' ? 'rgba(34,197,94,0.2)' : 'var(--bg)',
          }}
          animate={{ opacity: stage === 'decode' ? 1 : 0.5 }}
        >
          <div className="text-center">
            <div className="text-2xl mb-1">✨</div>
            <div className="text-xs text-text-secondary">Generated</div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-bg rounded-lg border border-red-500/30">
          <div className="text-xs text-red-400 font-medium">Pixel Diffusion</div>
          <div className="text-lg font-mono">786,432 dims</div>
          <div className="text-xs text-text-secondary">~24GB GPU memory</div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-green-500/30">
          <div className="text-xs text-green-500 font-medium">Latent Diffusion</div>
          <div className="text-lg font-mono">16,384 dims</div>
          <div className="text-xs text-text-secondary">~8GB GPU memory (48× smaller)</div>
        </div>
      </div>
    </div>
  );
}
