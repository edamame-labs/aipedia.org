import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../lib/motion';
import { createRng } from '../../lib/rng';

interface Person {
  id: string;
  prefs: string[];
  match: string | null;
  proposedIndex: number;
  rejectedBy: string[];
}

interface TraceItem {
  step: number;
  text: string;
}

const MEN = ['A', 'B', 'C', 'D'];
const WOMEN = ['1', '2', '3', '4'];

// Fisher-Yates. Sorting with a random comparator is both biased and
// implementation-defined, so Node and the browser disagreed on the ordering and
// the server-rendered preference lists did not survive hydration.
const shuffle = <T,>(arr: T[], random: () => number) => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const randomPrefs = (round: number) => {
  const random = createRng(28871 + round * 7919);
  return {
    men: MEN.map(id => ({ id, prefs: shuffle(WOMEN, random) })),
    women: WOMEN.map(id => ({ id, prefs: shuffle(MEN, random) }))
  };
};

const initState = (round = 0) => {
  const { men, women } = randomPrefs(round);
  return {
    men: men.map(m => ({ ...m, match: null as string | null, proposedIndex: 0, rejectedBy: [] as string[] })),
    women: women.map(w => ({ ...w, match: null as string | null, proposedIndex: 0, rejectedBy: [] as string[] })),
    step: 0,
    done: false,
    activeMan: null as string | null,
    trace: [] as TraceItem[]
  };
};

export function StableMarriageViz() {
  const [state, setState] = useState(initState);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [round, setRound] = useState(0);

  const womenMap = useMemo(() => new Map(state.women.map(w => [w.id, w])), [state.women]);

  const stepOnce = useCallback(() => {
    setState(prev => {
      if (prev.done) return prev;
      const men = prev.men.map(m => ({ ...m }));
      const women = prev.women.map(w => ({ ...w }));
      const trace = [...prev.trace];

      const man = men.find(m => !m.match && m.proposedIndex < m.prefs.length);
      if (!man) {
        trace.push({ step: prev.step, text: 'All participants matched. Algorithm terminates.' });
        return { ...prev, men, women, done: true, activeMan: null, trace };
      }

      const womanId = man.prefs[man.proposedIndex];
      const woman = women.find(w => w.id === womanId)!;
      man.proposedIndex++;

      let text = `${man.id} proposes to ${woman.id}. `;

      if (!woman.match) {
        woman.match = man.id;
        man.match = woman.id;
        text += 'She is free and accepts.';
      } else {
        const current = woman.match;
        const prefersNew = woman.prefs.indexOf(man.id) < woman.prefs.indexOf(current);
        if (prefersNew) {
          const old = men.find(m => m.id === current)!;
          old.match = null;
          old.rejectedBy.push(woman.id);
          woman.match = man.id;
          man.match = woman.id;
          text += `She prefers ${man.id} over ${current}; ${current} is rejected.`;
        } else {
          man.rejectedBy.push(woman.id);
          text += `She prefers ${woman.match}; ${man.id} is rejected.`;
        }
      }

      trace.push({ step: prev.step + 1, text });
      return { men, women, step: prev.step + 1, done: false, activeMan: man.id, trace };
    });
  }, []);

  useEffect(() => {
    if (!playing || state.done) return;
    const t = setTimeout(stepOnce, speed);
    return () => clearTimeout(t);
  }, [playing, state.done, state.step, speed, stepOnce]);

  const reset = () => {
    setState(initState(round + 1));
    setRound(r => r + 1);
    setPlaying(false);
  };

  const blockingPairs = useMemo(() => {
    if (!state.done) return [] as string[];
    const pairs: string[] = [];
    for (const m of state.men) {
      for (const w of state.women) {
        if (m.match === w.id) continue;
        const mPrefers = m.prefs.indexOf(w.id) < m.prefs.indexOf(m.match!);
        const wPrefers = w.prefs.indexOf(m.id) < w.prefs.indexOf(w.match!);
        if (mPrefers && wPrefers) pairs.push(`${m.id}-${w.id}`);
      }
    }
    return pairs;
  }, [state]);

  const node = (label: string, active = false) => (
    <div className={`w-14 h-14 rounded-full flex items-center justify-center border border-border ${active ? 'bg-accent text-white' : 'bg-bg-secondary text-text'}`}>{label}</div>
  );

  return (
    <div className="p-6 bg-bg-secondary border border-border rounded-xl">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button onClick={() => setPlaying(p => !p)} className="px-3 py-2 rounded bg-accent text-white">{playing ? 'Pause' : 'Play'}</button>
        <button onClick={stepOnce} disabled={playing} className="px-3 py-2 rounded border border-border">Step</button>
        <button onClick={reset} className="px-3 py-2 rounded border border-border">Randomize</button>
        <div className="flex items-center gap-2 ml-auto text-sm text-text-secondary">
          Speed
          <input type="range" min={200} max={1500} step={100} value={speed} onChange={e => setSpeed(+e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 relative">
        <div className="space-y-4">
          <div className="text-sm text-text-secondary">Men</div>
          {state.men.map(m => (
            <div key={m.id}>
              {node(m.id, state.activeMan === m.id)}
              <div className="text-xs text-text-secondary mt-1">{m.prefs.join(' › ')}</div>
            </div>
          ))}
        </div>

        <svg className="absolute inset-0 pointer-events-none">
          {state.men.filter(m => m.match).map((m, i) => {
            const j = state.women.findIndex(w => w.id === m.match);
            const y1 = 80 + i * 96;
            const y2 = 80 + j * 96;
            return (
              <motion.path
                key={`${m.id}-${m.match}`}
                d={`M 120 ${y1} C 260 ${y1}, 360 ${y2}, 500 ${y2}`}
                fill="none"
                stroke="#22c55e"
                strokeWidth={3}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            );
          })}
        </svg>

        <div className="space-y-4">
          <div className="text-sm text-text-secondary">Women</div>
          {state.women.map(w => (
            <div key={w.id}>
              {node(w.id)}
              <div className="text-xs text-text-secondary mt-1">{w.prefs.join(' › ')}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="p-3 border border-border rounded bg-bg">
          <div className="text-sm font-medium mb-2">Trace</div>
          <div className="text-xs space-y-1 max-h-40 overflow-auto">
            <AnimatePresence>
              {state.trace.slice(-6).map(t => (
                <motion.div key={t.step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {t.step}. {t.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-3 border border-border rounded bg-bg">
          <div className="text-sm font-medium mb-2">Stability Check</div>
          {state.done ? (
            blockingPairs.length === 0 ? (
              <div className="text-sm text-green-600">No blocking pairs — matching is stable.</div>
            ) : (
              <div className="text-sm text-red-600">Blocking pairs: {blockingPairs.join(', ')}</div>
            )
          ) : (
            <div className="text-sm text-text-secondary">Complete the algorithm to verify stability.</div>
          )}
        </div>
      </div>
    </div>
  );
}
