import { useState } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

export function VLAEViz() {
  const [beta, setBeta] = useState(0.5);
  const [showBitsBack, setShowBitsBack] = useState(false);

  const reconstruction = 1 - beta * 0.3;
  const compression = beta;
  const bitsBackGain = beta * 0.4;

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Variational Lossy Autoencoder</h3>
        <button
          onClick={() => setShowBitsBack(!showBitsBack)}
          className={`px-3 py-1 text-xs rounded-md border ${
            showBitsBack ? 'border-green-500 text-green-500' : 'border-border text-text-secondary'
          }`}
        >
          Bits-Back: {showBitsBack ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm">Rate-Distortion Trade-off (β)</span>
          <span className="text-xs text-text-secondary">{beta.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={beta}
          onChange={(e) => setBeta(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-text-secondary mt-1">
          <span>High Fidelity</span>
          <span>High Compression</span>
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4 mb-4">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-lg flex items-center justify-center mb-1">
              <span className="text-2xl">📷</span>
            </div>
            <span className="text-xs text-text-secondary">Input x</span>
          </div>
          
          <motion.div 
            className="text-accent"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            →
          </motion.div>
          
          <div className="text-center">
            <motion.div 
              className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-1"
              animate={{ width: 48 - compression * 20 }}
            >
              <span className="text-white text-xs">z</span>
            </motion.div>
            <span className="text-xs text-text-secondary">Latent</span>
          </div>
          
          <motion.div 
            className="text-accent"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
          >
            →
          </motion.div>
          
          <div className="text-center">
            <motion.div 
              className="w-16 h-16 bg-accent/20 rounded-lg flex items-center justify-center mb-1"
              animate={{ opacity: reconstruction }}
            >
              <span className="text-2xl">📷</span>
            </motion.div>
            <span className="text-xs text-text-secondary">Recon x̂</span>
          </div>
        </div>

        {showBitsBack && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/30"
          >
            <div className="text-xs text-green-500 font-medium mb-1">Bits-Back Coding</div>
            <div className="text-xs text-text-secondary">
              Encoder "steals" {(bitsBackGain * 100).toFixed(0)}% bits from decoder's randomness. 
              Net rate lower than naive encoding!
            </div>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-bg rounded-lg border border-border text-center">
          <div className="text-lg font-bold text-accent">{(reconstruction * 100).toFixed(0)}%</div>
          <div className="text-xs text-text-secondary">Reconstruction</div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border text-center">
          <div className="text-lg font-bold text-green-500">{(compression * 100).toFixed(0)}%</div>
          <div className="text-xs text-text-secondary">Compression</div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border text-center">
          <div className="text-lg font-bold text-orange-500">{(bitsBackGain * 100).toFixed(0)}%</div>
          <div className="text-xs text-text-secondary">Bits-Back Gain</div>
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4">
        <div className="text-sm font-medium mb-2">The VLAE Objective</div>
        <div className="font-mono text-xs bg-bg-secondary p-2 rounded">
          L = E[log p(x|z)] - β · D<sub>KL</sub>(q(z|x) || p(z))
        </div>
        <div className="text-xs text-text-secondary mt-2">
          β controls rate-distortion trade-off. Higher β = more compression, less fidelity.
        </div>
      </div>
    </div>
  );
}
