import { useState } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

type BlockType = 'original' | 'preact';

interface BlockDiagramProps {
  type: BlockType;
  isActive: boolean;
}

function BlockDiagram({ type, isActive }: BlockDiagramProps) {
  const isOriginal = type === 'original';
  
  const layers = isOriginal
    ? [
        { name: 'Conv', color: 'rgb(99, 102, 241)' },
        { name: 'BN', color: 'rgb(156, 163, 175)' },
        { name: 'ReLU', color: 'rgb(249, 115, 22)' },
        { name: 'Conv', color: 'rgb(99, 102, 241)' },
        { name: 'BN', color: 'rgb(156, 163, 175)' },
        { name: '+ add', color: 'rgb(34, 197, 94)' },
        { name: 'ReLU', color: 'rgb(249, 115, 22)' },
      ]
    : [
        { name: 'BN', color: 'rgb(156, 163, 175)' },
        { name: 'ReLU', color: 'rgb(249, 115, 22)' },
        { name: 'Conv', color: 'rgb(99, 102, 241)' },
        { name: 'BN', color: 'rgb(156, 163, 175)' },
        { name: 'ReLU', color: 'rgb(249, 115, 22)' },
        { name: 'Conv', color: 'rgb(99, 102, 241)' },
        { name: '+ add', color: 'rgb(34, 197, 94)' },
      ];

  const addIndex = layers.findIndex(l => l.name === '+ add');

  return (
    <div className={`p-4 bg-bg rounded-lg border ${isActive ? 'border-accent' : 'border-border'}`}>
      <div className="text-sm font-medium mb-3 text-center">
        {isOriginal ? 'Original (Post-activation)' : 'Pre-activation'}
      </div>
      
      <div className="relative flex flex-col items-center gap-1">
        <div className="w-16 h-6 bg-bg-secondary rounded flex items-center justify-center text-xs">
          x
        </div>
        
        <div className="flex">
          <div className="flex flex-col items-center">
            {layers.map((layer, i) => (
              <motion.div
                key={i}
                className="w-16 h-7 my-0.5 rounded flex items-center justify-center text-xs text-white font-medium"
                style={{ backgroundColor: layer.color }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {layer.name}
              </motion.div>
            ))}
          </div>
          
          <svg
            className="ml-1"
            width="40"
            height={layers.length * 32 + 24}
            style={{ marginTop: '12px' }}
          >
            <motion.path
              d={`M 0 0 Q 20 0 20 ${addIndex * 32 + 16} Q 20 ${addIndex * 32 + 32} 0 ${addIndex * 32 + 32}`}
              fill="none"
              stroke="rgb(34, 197, 94)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
          </svg>
        </div>
        
        <div className="w-16 h-6 bg-bg-secondary rounded flex items-center justify-center text-xs">
          out
        </div>
      </div>
      
      <div className="mt-3 text-xs text-text-secondary text-center">
        {isOriginal
          ? 'ReLU after addition blocks gradient'
          : 'Clean identity path for gradients'}
      </div>
    </div>
  );
}

export function IdentityMappingViz() {
  const [selected, setSelected] = useState<BlockType>('preact');

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Identity Mappings in ResNets</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div onClick={() => setSelected('original')} className="cursor-pointer">
          <BlockDiagram type="original" isActive={selected === 'original'} />
        </div>
        <div onClick={() => setSelected('preact')} className="cursor-pointer">
          <BlockDiagram type="preact" isActive={selected === 'preact'} />
        </div>
      </div>

      <div className="bg-bg rounded-lg border border-border p-4 mb-4">
        <div className="text-sm font-medium mb-2">Gradient Flow Comparison</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs">Original: gradient passes through ReLU after addition</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs">Pre-activation: gradient flows directly via identity</span>
          </div>
        </div>
        
        <div className="mt-3 font-mono text-xs bg-bg-secondary p-2 rounded">
          <div className="text-text-secondary">Original:</div>
          <div>h<sub>l+1</sub> = ReLU(h<sub>l</sub> + F(h<sub>l</sub>))</div>
          <div className="text-text-secondary mt-2">Pre-activation:</div>
          <div className="text-green-500">h<sub>l+1</sub> = h<sub>l</sub> + F(BN(ReLU(h<sub>l</sub>)))</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-lg font-bold text-accent">1001</div>
          <div className="text-xs text-text-secondary">Layers trainable</div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-lg font-bold text-green-500">4.92%</div>
          <div className="text-xs text-text-secondary">CIFAR-10 error</div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-lg font-bold text-accent">~0.5%</div>
          <div className="text-xs text-text-secondary">Improvement</div>
        </div>
      </div>
    </div>
  );
}
