import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../lib/motion';

interface TreeNode {
  id: string;
  label: string;
  status: 'pending' | 'searching' | 'found' | 'not_found';
  children?: TreeNode[];
  hasNeedle?: boolean;
}

function generateChunks(depth: number, needlePath: number[]): TreeNode[] {
  if (depth >= 3) return [];

  return Array.from({ length: 4 }, (_, i) => ({
    id: `${depth}-${i}`,
    label: `Chunk ${i + 1}`,
    status: 'pending' as const,
    hasNeedle: needlePath[depth] === i,
    children: needlePath[depth] === i ? generateChunks(depth + 1, needlePath) : [],
  }));
}

export function RLMViz() {
  const [mode, setMode] = useState<'concept' | 'search'>('concept');
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchDepth, setSearchDepth] = useState(-1);
  const [foundPath, setFoundPath] = useState<string[]>([]);

  // Needle path: which chunk at each level contains the needle
  const needlePath = [2, 1, 3]; // Chunk 3 -> Chunk 2 -> Chunk 4
  const tree = generateChunks(0, needlePath);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (mode === 'search') {
        if (searchDepth < 3) {
          setSearchDepth(d => d + 1);
          setFoundPath(prev => [...prev, `${searchDepth + 1}-${needlePath[searchDepth + 1] ?? 0}`]);
        } else {
          setIsPlaying(false);
        }
      } else {
        if (step < 4) {
          setStep(s => s + 1);
        } else {
          setIsPlaying(false);
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isPlaying, step, searchDepth, mode, needlePath]);

  const resetDemo = () => {
    setStep(0);
    setSearchDepth(-1);
    setFoundPath([]);
    setIsPlaying(false);
  };

  const conceptSteps = [
    { title: 'Traditional LLM', desc: 'Entire context loaded into prompt' },
    { title: 'Context Overflow', desc: 'Model fails with large inputs' },
    { title: 'RLM: Context as Variable', desc: 'Context stored in REPL environment' },
    { title: 'Programmatic Access', desc: 'Model queries slices via code' },
    { title: 'Recursive Calls', desc: 'Sub-LLMs process chunks independently' },
  ];

  const renderTreeNode = (node: TreeNode, depth: number, index: number) => {
    const isInPath = foundPath.includes(node.id) || (searchDepth === depth && node.hasNeedle);
    const isSearching = searchDepth === depth && node.hasNeedle;
    const isFound = searchDepth > depth && node.hasNeedle;
    const isChecked = searchDepth >= depth;

    return (
      <motion.div
        key={node.id}
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: depth * 0.1 + index * 0.05 }}
      >
        <motion.div
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 ${
            isSearching
              ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
              : isFound
              ? 'bg-green-500/20 border-green-500 text-green-400'
              : isChecked && !node.hasNeedle
              ? 'bg-red-500/10 border-red-500/50 text-red-400/50'
              : 'bg-bg border-border text-text-secondary'
          }`}
          animate={isSearching ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: isSearching ? Infinity : 0, duration: 0.5 }}
        >
          {node.label}
          {node.hasNeedle && searchDepth >= depth && (
            <span className="ml-1">{isFound ? '✓' : '🔍'}</span>
          )}
        </motion.div>

        {node.children && node.children.length > 0 && searchDepth > depth && (
          <div className="mt-2 flex gap-2">
            <div className="w-px h-4 bg-border" />
          </div>
        )}

        {node.children && node.children.length > 0 && searchDepth > depth && (
          <div className="flex gap-1 mt-1">
            {node.children.map((child, i) => renderTreeNode(child, depth + 1, i))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recursive Language Model</h3>
        <div className="flex gap-2">
          <button
            onClick={() => { setMode('concept'); resetDemo(); }}
            className={`px-3 py-1 text-xs rounded-md border ${
              mode === 'concept' ? 'border-accent text-accent' : 'border-border text-text-secondary'
            }`}
          >
            Concept
          </button>
          <button
            onClick={() => { setMode('search'); resetDemo(); }}
            className={`px-3 py-1 text-xs rounded-md border ${
              mode === 'search' ? 'border-green-500 text-green-500' : 'border-border text-text-secondary'
            }`}
          >
            Search Demo
          </button>
        </div>
      </div>

      {mode === 'concept' ? (
        <div className="space-y-6">
          {/* Traditional vs RLM comparison */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              className={`p-4 rounded-lg border-2 ${
                step < 2 ? 'border-red-500/50 bg-red-500/10' : 'border-border bg-bg'
              }`}
              animate={{ opacity: step >= 2 ? 0.5 : 1 }}
            >
              <div className="text-sm font-medium text-red-400 mb-2">Traditional LLM</div>
              <div className="bg-bg rounded p-2 mb-2">
                <code className="text-xs text-text-secondary">
                  llm.completion(prompt + context)
                </code>
              </div>
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-4 h-4 rounded bg-red-500/30 border border-red-500/50"
                    animate={step === 1 ? {
                      backgroundColor: i > 7 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.3)',
                      borderColor: i > 7 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.5)'
                    } : {}}
                  />
                ))}
              </div>
              {step >= 1 && (
                <motion.div
                  className="text-xs text-red-400 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Context window exceeded
                </motion.div>
              )}
            </motion.div>

            <motion.div
              className={`p-4 rounded-lg border-2 ${
                step >= 2 ? 'border-green-500/50 bg-green-500/10' : 'border-border bg-bg'
              }`}
              animate={{ opacity: step < 2 ? 0.5 : 1 }}
            >
              <div className="text-sm font-medium text-green-400 mb-2">RLM</div>
              <div className="bg-bg rounded p-2 mb-2">
                <code className="text-xs text-text-secondary">
                  rlm.completion(query, env=context)
                </code>
              </div>
              {step >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <div className="text-xs text-text-secondary">REPL Environment:</div>
                  <div className="flex gap-1 flex-wrap">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-4 h-4 rounded bg-green-500/30 border border-green-500/50"
                        animate={step >= 3 && i % 3 === 0 ? {
                          scale: [1, 1.2, 1],
                          backgroundColor: 'rgba(34, 197, 94, 0.5)'
                        } : {}}
                        transition={{ delay: i * 0.1, repeat: step >= 3 ? Infinity : 0, duration: 1 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Step indicator */}
          <div className="flex gap-2 justify-center">
            {conceptSteps.map((s, i) => (
              <motion.div
                key={i}
                className={`px-3 py-2 rounded-lg text-xs ${
                  i === step ? 'bg-accent text-white' : 'bg-bg text-text-secondary'
                }`}
                animate={{ scale: i === step ? 1.05 : 1 }}
              >
                {s.title}
              </motion.div>
            ))}
          </div>

          <div className="text-center text-sm text-text-secondary">
            {conceptSteps[step]?.desc}
          </div>

          {/* Recursive call visualization */}
          {step >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg rounded-lg border border-border p-4"
            >
              <div className="text-xs text-text-secondary mb-3 text-center">Recursive Sub-calls</div>
              <div className="flex justify-center gap-4">
                {['Query chunk 1', 'Query chunk 2', 'Query chunk 3'].map((label, i) => (
                  <motion.div
                    key={i}
                    className="px-3 py-2 rounded bg-accent/20 border border-accent/50 text-xs text-accent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                  >
                    rlm({label})
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search tree visualization */}
          <div className="bg-bg rounded-lg border border-border p-4">
            <div className="text-xs text-text-secondary mb-4 text-center">
              Needle-in-Haystack: Finding "secret_code=42" in 10M tokens
            </div>

            <div className="flex justify-center mb-4">
              <div className="flex flex-col items-center">
                <motion.div
                  className="px-4 py-2 rounded-lg bg-accent/20 border-2 border-accent text-sm font-medium"
                  animate={searchDepth === -1 && isPlaying ? { scale: [1, 1.05, 1] } : {}}
                >
                  Root LLM
                </motion.div>

                {searchDepth >= 0 && (
                  <div className="w-px h-4 bg-border mt-2" />
                )}

                {searchDepth >= 0 && (
                  <div className="flex gap-2 mt-2">
                    {tree.map((node, i) => renderTreeNode(node, 0, i))}
                  </div>
                )}
              </div>
            </div>

            {/* Search progress */}
            <div className="flex justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-yellow-500/30 border border-yellow-500" />
                <span className="text-text-secondary">Searching</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500/30 border border-green-500" />
                <span className="text-text-secondary">Found</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500/10 border border-red-500/50" />
                <span className="text-text-secondary">Skipped</span>
              </div>
            </div>
          </div>

          {/* Complexity comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-bg rounded-lg border border-border">
              <div className="text-sm font-medium text-red-400 mb-1">Traditional: O(N)</div>
              <div className="text-xs text-text-secondary">
                Scan all 10M tokens sequentially
              </div>
              <div className="mt-2 h-2 bg-red-500/30 rounded" style={{ width: '100%' }} />
            </div>
            <div className="p-3 bg-bg rounded-lg border border-border">
              <div className="text-sm font-medium text-green-400 mb-1">RLM: O(log N)</div>
              <div className="text-xs text-text-secondary">
                Binary search via recursive queries
              </div>
              <div className="mt-2 h-2 bg-green-500/30 rounded" style={{ width: '20%' }} />
            </div>
          </div>

          {searchDepth >= 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center p-3 bg-green-500/10 border border-green-500/50 rounded-lg"
            >
              <span className="text-green-400 font-medium">Found: secret_code=42</span>
              <div className="text-xs text-text-secondary mt-1">
                Searched only {Math.pow(4, searchDepth + 1)} chunks instead of 10M tokens
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-3 mt-6">
        <button
          onClick={() => { resetDemo(); setIsPlaying(true); }}
          className="px-4 py-2 text-sm rounded-lg bg-accent text-white hover:bg-accent/80"
        >
          {isPlaying ? 'Restart' : 'Play Demo'}
        </button>
        <button
          onClick={resetDemo}
          className="px-4 py-2 text-sm rounded-lg border border-border text-text-secondary hover:border-accent"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
