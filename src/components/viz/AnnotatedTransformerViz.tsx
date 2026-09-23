import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../lib/motion';

type Component = 'embedding' | 'encoder' | 'decoder' | 'attention' | 'ffn' | 'output';

interface ComponentInfo {
  id: Component;
  name: string;
  code: string;
  description: string;
}

const COMPONENTS: ComponentInfo[] = [
  {
    id: 'embedding',
    name: 'Embeddings + Positional Encoding',
    code: `class Embeddings(nn.Module):
    def forward(self, x):
        return self.lut(x) * math.sqrt(self.d_model)

class PositionalEncoding(nn.Module):
    def forward(self, x):
        x = x + self.pe[:, :x.size(1)]
        return self.dropout(x)`,
    description: 'Token embeddings scaled by √d_model, plus sinusoidal position encodings',
  },
  {
    id: 'attention',
    name: 'Multi-Head Attention',
    code: `def attention(query, key, value, mask=None):
    scores = torch.matmul(query, key.transpose(-2, -1))
    scores = scores / math.sqrt(d_k)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    p_attn = scores.softmax(dim=-1)
    return torch.matmul(p_attn, value), p_attn`,
    description: 'Scaled dot-product attention with optional masking for decoder',
  },
  {
    id: 'ffn',
    name: 'Feed-Forward Network',
    code: `class PositionwiseFeedForward(nn.Module):
    def forward(self, x):
        return self.w_2(self.dropout(self.w_1(x).relu()))`,
    description: 'Two linear layers with ReLU: expand to 4x, then project back',
  },
  {
    id: 'encoder',
    name: 'Encoder Layer',
    code: `class EncoderLayer(nn.Module):
    def forward(self, x, mask):
        x = self.sublayer[0](x, lambda x: self.self_attn(x, x, x, mask))
        return self.sublayer[1](x, self.feed_forward)`,
    description: 'Self-attention → Add & Norm → FFN → Add & Norm',
  },
  {
    id: 'decoder',
    name: 'Decoder Layer',
    code: `class DecoderLayer(nn.Module):
    def forward(self, x, memory, src_mask, tgt_mask):
        x = self.sublayer[0](x, lambda x: self.self_attn(x, x, x, tgt_mask))
        x = self.sublayer[1](x, lambda x: self.src_attn(x, m, m, src_mask))
        return self.sublayer[2](x, self.feed_forward)`,
    description: 'Masked self-attention → Cross-attention → FFN, each with Add & Norm',
  },
  {
    id: 'output',
    name: 'Generator',
    code: `class Generator(nn.Module):
    def forward(self, x):
        return log_softmax(self.proj(x), dim=-1)`,
    description: 'Project to vocabulary size and apply log-softmax for next token prediction',
  },
];

export function AnnotatedTransformerViz() {
  const [selected, setSelected] = useState<Component>('attention');
  const selectedComponent = COMPONENTS.find(c => c.id === selected)!;

  const architectureBlocks = [
    { id: 'embedding' as const, label: 'Embed + PE', color: 'rgb(34, 197, 94)' },
    { id: 'encoder' as const, label: 'Encoder ×N', color: 'rgb(99, 102, 241)' },
    { id: 'decoder' as const, label: 'Decoder ×N', color: 'rgb(236, 72, 153)' },
    { id: 'output' as const, label: 'Generator', color: 'rgb(249, 115, 22)' },
  ];

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">The Annotated Transformer</h3>
        <a
          href="https://nlp.seas.harvard.edu/annotated-transformer/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent hover:underline"
        >
          Full article →
        </a>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {architectureBlocks.map((block, i) => (
          <motion.div
            key={block.id}
            className={`px-3 py-6 rounded-lg cursor-pointer text-center min-w-[80px] ${
              selected === block.id ? 'ring-2 ring-white' : ''
            }`}
            style={{ backgroundColor: block.color }}
            onClick={() => setSelected(block.id)}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="text-xs text-white font-medium">{block.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap justify-center">
        {COMPONENTS.map((comp) => (
          <button
            key={comp.id}
            onClick={() => setSelected(comp.id)}
            className={`px-3 py-1 text-xs rounded-md border ${
              selected === comp.id
                ? 'border-accent text-accent bg-accent/10'
                : 'border-border text-text-secondary'
            }`}
          >
            {comp.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-bg rounded-lg border border-border overflow-hidden"
        >
          <div className="p-3 border-b border-border">
            <div className="text-sm font-medium">{selectedComponent.name}</div>
            <div className="text-xs text-text-secondary">{selectedComponent.description}</div>
          </div>
          <pre className="p-4 text-xs overflow-x-auto bg-[#1a1a2e]">
            <code className="text-green-400">{selectedComponent.code}</code>
          </pre>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-lg font-bold text-accent">~400</div>
          <div className="text-xs text-text-secondary">Lines of PyTorch</div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-lg font-bold text-accent">6</div>
          <div className="text-xs text-text-secondary">Core Components</div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-lg font-bold text-accent">100%</div>
          <div className="text-xs text-text-secondary">Annotated</div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-accent/10 to-transparent rounded-lg border border-accent/30">
        <div className="text-sm font-medium text-accent mb-1">Why This Resource Matters</div>
        <div className="text-xs text-text-secondary">
          The Annotated Transformer bridges theory and practice—seeing the actual code alongside
          explanations makes the architecture concrete and reproducible.
        </div>
      </div>
    </div>
  );
}
