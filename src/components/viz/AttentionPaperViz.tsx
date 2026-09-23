import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../lib/motion';

type Tab = 'attention' | 'multihead' | 'positional' | 'architecture';

const TABS: { id: Tab; label: string }[] = [
  { id: 'attention', label: 'Scaled Dot-Product' },
  { id: 'multihead', label: 'Multi-Head' },
  { id: 'positional', label: 'Positional Encoding' },
  { id: 'architecture', label: 'Architecture' },
];

const TOKENS = ['I', 'love', 'deep', 'learning'];

function softmax(values: number[]): number[] {
  const max = Math.max(...values);
  const exps = values.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

// Generate deterministic Q, K, V matrices for demo
function generateQKV(seed: number) {
  const rand = (s: number) => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
  const dim = 4;
  const n = TOKENS.length;
  const make = (offset: number) =>
    Array.from({ length: n }, (_, i) =>
      Array.from({ length: dim }, (_, j) =>
        Math.round((rand(seed + offset + i * dim + j) * 2 - 1) * 100) / 100
      )
    );
  return { Q: make(0), K: make(100), V: make(200) };
}

// --- Scaled Dot-Product Attention Tab ---
function ScaledDotProductSection() {
  const [step, setStep] = useState(0);
  const [hoveredCell, setHoveredCell] = useState<{ i: number; j: number } | null>(null);

  const { Q, K, V } = useMemo(() => generateQKV(42), []);
  const dk = Q[0].length;

  const rawScores = useMemo(
    () => Q.map(q => K.map(k => Math.round(dotProduct(q, k) * 100) / 100)),
    [Q, K]
  );

  const scaledScores = useMemo(
    () => rawScores.map(row => row.map(v => Math.round((v / Math.sqrt(dk)) * 100) / 100)),
    [rawScores, dk]
  );

  const weights = useMemo(
    () => scaledScores.map(row => softmax(row)),
    [scaledScores]
  );

  const steps = [
    { label: 'QKᵀ', desc: 'Compute raw attention scores by multiplying Q and Kᵀ' },
    { label: 'Scale (÷√dₖ)', desc: `Divide by √dₖ = √${dk} ≈ ${Math.sqrt(dk).toFixed(2)} to prevent large values` },
    { label: 'Softmax', desc: 'Apply softmax to get attention weights (rows sum to 1)' },
    { label: 'Weighted V', desc: 'Multiply weights by V to get the attention output' },
  ];

  const displayMatrix = step === 0 ? rawScores : step === 1 ? scaledScores : weights;
  const maxVal = Math.max(...displayMatrix.flat().map(Math.abs));

  const cellSize = 64;
  const labelW = 56;

  return (
    <div>
      {/* Step selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
              step === i
                ? 'border-accent text-accent bg-accent/10'
                : 'border-border text-text-secondary hover:border-accent/50'
            }`}
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </div>

      <div className="p-3 bg-bg rounded-lg border border-border mb-4 text-sm text-text-secondary">
        {steps[step].desc}
      </div>

      {/* Matrix visualization */}
      {step < 3 ? (
        <div className="flex justify-center overflow-x-auto">
          <div>
            {/* Column headers */}
            <div className="flex">
              <div style={{ width: labelW }} />
              {TOKENS.map((t, i) => (
                <div
                  key={i}
                  style={{ width: cellSize }}
                  className="text-xs text-center text-text-secondary font-mono"
                >
                  {t}
                </div>
              ))}
            </div>
            {/* Rows */}
            {TOKENS.map((token, i) => (
              <div key={i} className="flex items-center">
                <div
                  style={{ width: labelW }}
                  className="text-xs text-right pr-2 text-text-secondary font-mono"
                >
                  {token}
                </div>
                {displayMatrix[i].map((val, j) => {
                  const intensity = step === 2 ? val : Math.abs(val) / (maxVal || 1);
                  const isHovered = hoveredCell?.i === i && hoveredCell?.j === j;
                  return (
                    <motion.div
                      key={j}
                      style={{ width: cellSize, height: cellSize }}
                      className="p-0.5"
                      onMouseEnter={() => setHoveredCell({ i, j })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <motion.div
                        className="w-full h-full rounded-md flex items-center justify-center text-xs font-mono cursor-default"
                        style={{
                          backgroundColor: `rgba(99, 102, 241, ${Math.min(intensity * 0.85, 0.85)})`,
                        }}
                        animate={{
                          scale: isHovered ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.15 }}
                      >
                        <span className={intensity > 0.5 ? 'text-white' : 'text-text'}>
                          {step === 2 ? val.toFixed(2) : val.toFixed(1)}
                        </span>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Step 4: Show weighted sum result */
        <div className="space-y-3">
          <div className="text-xs text-text-secondary mb-2">
            Each row of the output = weighted combination of V rows using attention weights
          </div>
          {TOKENS.map((token, i) => (
            <div key={i} className="p-3 bg-bg rounded-lg border border-border">
              <div className="text-xs font-medium text-accent mb-2">Output for "{token}"</div>
              <div className="flex gap-2 flex-wrap items-center">
                {TOKENS.map((t, j) => (
                  <span key={j} className="text-xs font-mono">
                    <span className="text-accent">{weights[i][j].toFixed(2)}</span>
                    <span className="text-text-secondary">×V({t})</span>
                    {j < TOKENS.length - 1 && <span className="text-text-secondary"> + </span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {hoveredCell && step < 3 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2 bg-bg rounded-lg border border-border text-xs text-center"
        >
          <span className="font-medium text-accent">{TOKENS[hoveredCell.i]}</span>
          <span className="text-text-secondary"> attending to </span>
          <span className="font-medium text-accent">{TOKENS[hoveredCell.j]}</span>
          <span className="text-text-secondary">: </span>
          <span className="font-mono">{displayMatrix[hoveredCell.i][hoveredCell.j].toFixed(3)}</span>
        </motion.div>
      )}
    </div>
  );
}

// --- Multi-Head Attention Tab ---
function MultiHeadSection() {
  const [activeHead, setActiveHead] = useState(0);
  const numHeads = 8;
  const headColors = [
    'rgb(99, 102, 241)', 'rgb(236, 72, 153)', 'rgb(34, 197, 94)', 'rgb(249, 115, 22)',
    'rgb(14, 165, 233)', 'rgb(168, 85, 247)', 'rgb(234, 179, 8)', 'rgb(239, 68, 68)',
  ];

  const headAttentions = useMemo(
    () =>
      Array.from({ length: numHeads }, (_, h) => {
        const { Q, K } = generateQKV(h * 50 + 7);
        const dk = Q[0].length;
        const scores = Q.map(q =>
          softmax(K.map(k => dotProduct(q, k) / Math.sqrt(dk)))
        );
        return scores;
      }),
    []
  );

  const headDescriptions = [
    'Positional: adjacent tokens',
    'Syntactic: subject-verb links',
    'Semantic: related meaning',
    'Long-range dependencies',
    'Local context window',
    'Punctuation and structure',
    'Coreference patterns',
    'Rare token attention',
  ];

  const cellSize = 52;

  return (
    <div>
      <div className="p-3 bg-bg rounded-lg border border-border mb-4 text-sm text-text-secondary">
        Each head learns different attention patterns. The outputs are concatenated and projected.
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {Array.from({ length: numHeads }, (_, i) => (
          <button
            key={i}
            onClick={() => setActiveHead(i)}
            className={`px-2.5 py-1.5 text-xs rounded-md border transition-all ${
              activeHead === i
                ? 'border-white/50 font-medium scale-105'
                : 'border-border text-text-secondary hover:border-white/30'
            }`}
            style={{
              backgroundColor: activeHead === i ? headColors[i] : 'transparent',
              color: activeHead === i ? 'white' : undefined,
            }}
          >
            Head {i + 1}
          </button>
        ))}
      </div>

      <div className="text-xs text-text-secondary mb-3 italic">
        Pattern: {headDescriptions[activeHead]}
      </div>

      {/* Attention matrix for active head */}
      <div className="flex justify-center overflow-x-auto mb-4">
        <div>
          <div className="flex">
            <div style={{ width: 48 }} />
            {TOKENS.map((t, i) => (
              <div key={i} style={{ width: cellSize }} className="text-xs text-center text-text-secondary">
                {t}
              </div>
            ))}
          </div>
          {TOKENS.map((token, i) => (
            <div key={i} className="flex items-center">
              <div style={{ width: 48 }} className="text-xs text-right pr-2 text-text-secondary">
                {token}
              </div>
              {headAttentions[activeHead][i].map((val, j) => (
                <motion.div
                  key={`${activeHead}-${i}-${j}`}
                  style={{ width: cellSize, height: cellSize }}
                  className="p-0.5"
                >
                  <motion.div
                    className="w-full h-full rounded-md flex items-center justify-center text-xs font-mono"
                    style={{
                      backgroundColor: headColors[activeHead].replace('rgb', 'rgba').replace(')', `, ${val * 0.85})`),
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (i * TOKENS.length + j) * 0.03 }}
                  >
                    <span className={val > 0.4 ? 'text-white' : 'text-text'}>{val.toFixed(2)}</span>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Concat + project illustration */}
      <div className="p-4 bg-bg rounded-lg border border-border">
        <div className="text-xs font-medium mb-2">Concat + Linear Projection</div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {Array.from({ length: numHeads }, (_, i) => (
            <motion.div
              key={i}
              className="h-8 rounded flex items-center justify-center text-xs text-white font-mono shrink-0"
              style={{
                width: 36,
                backgroundColor: headColors[i],
                opacity: activeHead === i ? 1 : 0.4,
              }}
              animate={{ opacity: activeHead === i ? 1 : 0.4 }}
            >
              h{i + 1}
            </motion.div>
          ))}
          <span className="text-text-secondary text-lg shrink-0">→</span>
          <div className="text-xs text-text-secondary shrink-0">W<sup>O</sup></div>
          <span className="text-text-secondary text-lg shrink-0">→</span>
          <motion.div
            className="h-8 px-3 rounded bg-accent/30 flex items-center text-xs font-mono shrink-0"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            output
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// --- Positional Encoding Tab ---
function PositionalEncodingSection() {
  const [hoveredPos, setHoveredPos] = useState<number | null>(null);
  const [showCosine, setShowCosine] = useState(false);

  const dModel = 32;
  const maxPos = 50;
  const displayDims = 16;

  const encodings = useMemo(() => {
    const pe: number[][] = [];
    for (let pos = 0; pos < maxPos; pos++) {
      const row: number[] = [];
      for (let i = 0; i < dModel; i++) {
        const dimIdx = Math.floor(i / 2);
        const angle = pos / Math.pow(10000, (2 * dimIdx) / dModel);
        row.push(i % 2 === 0 ? Math.sin(angle) : Math.cos(angle));
      }
      pe.push(row);
    }
    return pe;
  }, []);

  const visiblePositions = 20;
  const cellW = 24;
  const cellH = 16;

  return (
    <div>
      <div className="p-3 bg-bg rounded-lg border border-border mb-4 text-sm text-text-secondary">
        Sinusoidal encodings give each position a unique signature. Lower dimensions oscillate fast, higher ones slow.
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-text-secondary">
          Position × Dimension heatmap
        </div>
        <button
          onClick={() => setShowCosine(!showCosine)}
          className={`px-3 py-1 text-xs rounded-md border transition-colors ${
            showCosine
              ? 'border-accent text-accent bg-accent/10'
              : 'border-border text-text-secondary'
          }`}
        >
          {showCosine ? 'Showing cos dims' : 'Showing sin dims'}
        </button>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto mb-4">
        <div className="inline-block">
          {/* Dim labels */}
          <div className="flex">
            <div style={{ width: 32 }} />
            {Array.from({ length: displayDims }, (_, i) => (
              <div
                key={i}
                style={{ width: cellW }}
                className="text-center text-text-secondary"
                title={`dim ${showCosine ? i * 2 + 1 : i * 2}`}
              >
                <span className="text-[9px]">{showCosine ? i * 2 + 1 : i * 2}</span>
              </div>
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: visiblePositions }, (_, pos) => (
            <div
              key={pos}
              className="flex items-center"
              onMouseEnter={() => setHoveredPos(pos)}
              onMouseLeave={() => setHoveredPos(null)}
            >
              <div
                style={{ width: 32 }}
                className={`text-[9px] text-right pr-1 ${
                  hoveredPos === pos ? 'text-accent font-medium' : 'text-text-secondary'
                }`}
              >
                {pos}
              </div>
              {Array.from({ length: displayDims }, (_, d) => {
                const dimIdx = showCosine ? d * 2 + 1 : d * 2;
                const val = encodings[pos][dimIdx];
                const r = val > 0 ? 99 : 239;
                const g = val > 0 ? 102 : 68;
                const b = val > 0 ? 241 : 68;
                return (
                  <div
                    key={d}
                    style={{
                      width: cellW,
                      height: cellH,
                      backgroundColor: `rgba(${r}, ${g}, ${b}, ${Math.abs(val) * 0.8})`,
                    }}
                    className="border border-border/20"
                    title={`PE(${pos}, ${dimIdx}) = ${val.toFixed(3)}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Wave preview */}
      <div className="p-4 bg-bg rounded-lg border border-border">
        <div className="text-xs font-medium mb-2">Sine Waves Across Positions (first 4 dimensions)</div>
        <svg width="100%" height="100" viewBox="0 0 400 100" className="overflow-visible">
          {[0, 2, 4, 6].map((dim, idx) => {
            const colors = ['rgb(99, 102, 241)', 'rgb(236, 72, 153)', 'rgb(34, 197, 94)', 'rgb(249, 115, 22)'];
            const points = Array.from({ length: visiblePositions }, (_, pos) => {
              const x = (pos / (visiblePositions - 1)) * 380 + 10;
              const y = 50 - encodings[pos][dim] * 35;
              return `${x},${y}`;
            }).join(' ');
            return (
              <polyline
                key={dim}
                points={points}
                fill="none"
                stroke={colors[idx]}
                strokeWidth="1.5"
                opacity="0.7"
              />
            );
          })}
          {/* Axis */}
          <line x1="10" y1="50" x2="390" y2="50" stroke="gray" strokeWidth="0.5" strokeDasharray="4" />
        </svg>
        <div className="flex gap-4 mt-2 justify-center">
          {[0, 2, 4, 6].map((dim, idx) => {
            const colors = ['rgb(99, 102, 241)', 'rgb(236, 72, 153)', 'rgb(34, 197, 94)', 'rgb(249, 115, 22)'];
            return (
              <div key={dim} className="flex items-center gap-1">
                <div className="w-3 h-1 rounded" style={{ backgroundColor: colors[idx] }} />
                <span className="text-[10px] text-text-secondary">dim {dim}</span>
              </div>
            );
          })}
        </div>
      </div>

      {hoveredPos !== null && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2 bg-bg rounded-lg border border-border text-xs text-center"
        >
          Position <span className="font-mono text-accent">{hoveredPos}</span> encoding vector
          (first 8 dims):{' '}
          <span className="font-mono">
            [{encodings[hoveredPos].slice(0, 8).map(v => v.toFixed(2)).join(', ')}]
          </span>
        </motion.div>
      )}
    </div>
  );
}

// --- Architecture Tab ---
function ArchitectureSection() {
  const [highlighted, setHighlighted] = useState<string | null>(null);

  interface ArchBlock {
    id: string;
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    desc: string;
  }

  const blocks: ArchBlock[] = [
    { id: 'input-embed', label: 'Input\nEmbedding', x: 30, y: 310, w: 100, h: 40, color: 'rgb(34, 197, 94)', desc: 'Token → dense vector' },
    { id: 'input-pe', label: '+ Positional\nEncoding', x: 30, y: 260, w: 100, h: 40, color: 'rgb(34, 197, 94)', desc: 'Adds position info' },
    { id: 'enc-sa', label: 'Multi-Head\nSelf-Attention', x: 30, y: 190, w: 100, h: 45, color: 'rgb(99, 102, 241)', desc: 'Each token attends to all input tokens' },
    { id: 'enc-an1', label: 'Add & Norm', x: 30, y: 155, w: 100, h: 25, color: 'rgb(148, 163, 184)', desc: 'Residual connection + layer norm' },
    { id: 'enc-ffn', label: 'Feed\nForward', x: 30, y: 110, w: 100, h: 35, color: 'rgb(99, 102, 241)', desc: 'Two linear layers with ReLU' },
    { id: 'enc-an2', label: 'Add & Norm', x: 30, y: 80, w: 100, h: 25, color: 'rgb(148, 163, 184)', desc: 'Residual connection + layer norm' },

    { id: 'output-embed', label: 'Output\nEmbedding', x: 200, y: 310, w: 100, h: 40, color: 'rgb(236, 72, 153)', desc: 'Target token → dense vector' },
    { id: 'output-pe', label: '+ Positional\nEncoding', x: 200, y: 260, w: 100, h: 40, color: 'rgb(236, 72, 153)', desc: 'Adds position info' },
    { id: 'dec-msa', label: 'Masked\nSelf-Attention', x: 200, y: 190, w: 100, h: 45, color: 'rgb(236, 72, 153)', desc: 'Causal: only attend to past tokens' },
    { id: 'dec-an1', label: 'Add & Norm', x: 200, y: 155, w: 100, h: 25, color: 'rgb(148, 163, 184)', desc: 'Residual connection + layer norm' },
    { id: 'dec-ca', label: 'Cross\nAttention', x: 200, y: 110, w: 100, h: 35, color: 'rgb(168, 85, 247)', desc: 'Decoder attends to encoder output (K, V from encoder)' },
    { id: 'dec-an2', label: 'Add & Norm', x: 200, y: 80, w: 100, h: 25, color: 'rgb(148, 163, 184)', desc: 'Residual connection + layer norm' },
    { id: 'dec-ffn', label: 'Feed\nForward', x: 200, y: 45, w: 100, h: 30, color: 'rgb(236, 72, 153)', desc: 'Two linear layers with ReLU' },
    { id: 'dec-an3', label: 'Add & Norm', x: 200, y: 18, w: 100, h: 22, color: 'rgb(148, 163, 184)', desc: 'Residual connection + layer norm' },

    { id: 'linear', label: 'Linear', x: 200, y: -15, w: 100, h: 25, color: 'rgb(249, 115, 22)', desc: 'Project to vocabulary size' },
    { id: 'softmax', label: 'Softmax', x: 200, y: -45, w: 100, h: 22, color: 'rgb(249, 115, 22)', desc: 'Output probability distribution' },
  ];

  const highlightedBlock = blocks.find(b => b.id === highlighted);

  return (
    <div>
      <div className="p-3 bg-bg rounded-lg border border-border mb-4 text-sm text-text-secondary">
        The full encoder-decoder Transformer. Click any block to see its description.
      </div>

      <div className="flex justify-center overflow-x-auto">
        <svg width="340" height="390" viewBox="-5 -55 340 410" className="overflow-visible">
          {/* Labels */}
          <text x="80" y="-50" textAnchor="middle" className="fill-text-secondary" fontSize="11" fontWeight="600">
            Encoder ×N
          </text>
          <text x="250" y="-55" textAnchor="middle" className="fill-text-secondary" fontSize="11" fontWeight="600">
            Decoder ×N
          </text>

          {/* Encoder bracket */}
          <rect x="20" y="70" width="120" height="180" rx="8" fill="none" stroke="rgb(99, 102, 241)" strokeWidth="1" strokeDasharray="4" opacity="0.4" />
          {/* Decoder bracket */}
          <rect x="190" y="8" width="120" height="247" rx="8" fill="none" stroke="rgb(236, 72, 153)" strokeWidth="1" strokeDasharray="4" opacity="0.4" />

          {/* Cross-attention arrow from encoder to decoder */}
          <path
            d="M 130 92 C 160 92, 170 128, 200 128"
            fill="none"
            stroke="rgb(168, 85, 247)"
            strokeWidth="2"
            markerEnd="url(#arrowPurple)"
            opacity="0.7"
          />
          <defs>
            <marker id="arrowPurple" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="rgb(168, 85, 247)" />
            </marker>
          </defs>

          {/* Blocks */}
          {blocks.map((block) => {
            const isHighlighted = highlighted === block.id;
            return (
              <g
                key={block.id}
                onClick={() => setHighlighted(highlighted === block.id ? null : block.id)}
                className="cursor-pointer"
              >
                <rect
                  x={block.x}
                  y={block.y}
                  width={block.w}
                  height={block.h}
                  rx={6}
                  fill={block.color}
                  opacity={isHighlighted ? 1 : highlighted ? 0.4 : 0.7}
                  stroke={isHighlighted ? 'white' : 'none'}
                  strokeWidth={2}
                />
                {block.label.split('\n').map((line, li) => (
                  <text
                    key={li}
                    x={block.x + block.w / 2}
                    y={block.y + block.h / 2 + (li - (block.label.split('\n').length - 1) / 2) * 12}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize="9"
                    fontWeight="500"
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}

          {/* Input/output labels */}
          <text x="80" y="370" textAnchor="middle" className="fill-text-secondary" fontSize="10">
            Inputs
          </text>
          <text x="250" y="370" textAnchor="middle" className="fill-text-secondary" fontSize="10">
            Outputs (shifted right)
          </text>
          <text x="250" y="-50" textAnchor="middle" className="fill-text-secondary" fontSize="9">
            Output Probabilities ↑
          </text>
        </svg>
      </div>

      <AnimatePresence>
        {highlightedBlock && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-4 p-3 bg-bg rounded-lg border border-border"
          >
            <div className="text-sm font-medium" style={{ color: highlightedBlock.color }}>
              {highlightedBlock.label.replace('\n', ' ')}
            </div>
            <div className="text-xs text-text-secondary mt-1">{highlightedBlock.desc}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key numbers */}
      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        {[
          { label: 'Layers', value: '6' },
          { label: 'd_model', value: '512' },
          { label: 'Heads', value: '8' },
          { label: 'd_ff', value: '2048' },
        ].map((item) => (
          <div key={item.label} className="p-2 bg-bg rounded-lg border border-border">
            <div className="text-sm font-bold text-accent">{item.value}</div>
            <div className="text-[10px] text-text-secondary">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main Component ---
export function AttentionPaperViz() {
  const [activeTab, setActiveTab] = useState<Tab>('attention');

  const renderTab = useCallback(() => {
    switch (activeTab) {
      case 'attention':
        return <ScaledDotProductSection />;
      case 'multihead':
        return <MultiHeadSection />;
      case 'positional':
        return <PositionalEncodingSection />;
      case 'architecture':
        return <ArchitectureSection />;
    }
  }, [activeTab]);

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Attention Is All You Need — Interactive Explorer</h3>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
              activeTab === tab.id
                ? 'border-accent text-accent bg-accent/10'
                : 'border-border text-text-secondary hover:border-accent/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {renderTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
