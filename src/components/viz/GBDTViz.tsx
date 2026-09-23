import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Point {
  x: number;
  y: number;
}

const DATA: Point[] = [
  { x: 0.1, y: 1.2 },
  { x: 0.2, y: 1.8 },
  { x: 0.35, y: 2.4 },
  { x: 0.5, y: 2.9 },
  { x: 0.65, y: 3.1 },
  { x: 0.8, y: 3.6 },
];

const TREE_PREDICTIONS: ((x: number) => number)[] = [
  x => 1.8,
  x => (x < 0.4 ? 0.4 : -0.2),
  x => (x < 0.6 ? 0.3 : -0.1),
  x => (x < 0.3 ? 0.2 : -0.15),
  x => (x < 0.7 ? 0.15 : -0.05),
];

function ensemblePrediction(x: number, nTrees: number, lr: number) {
  let pred = 0;
  for (let i = 0; i < nTrees; i++) {
    pred += lr * TREE_PREDICTIONS[i](x);
  }
  return pred;
}

export function GBDTViz() {
  const [nTrees, setNTrees] = useState(1);
  const [learningRate, setLearningRate] = useState(0.3);

  const curveData = useMemo(() => {
    const xs = Array.from({ length: 40 }, (_, i) => i / 40);
    return xs.map(x => ({
      x,
      y: ensemblePrediction(x, nTrees, learningRate),
    }));
  }, [nTrees, learningRate]);

  const residuals = useMemo(() => {
    return DATA.map(p => ({
      ...p,
      yHat: ensemblePrediction(p.x, nTrees, learningRate),
      residual: p.y - ensemblePrediction(p.x, nTrees, learningRate),
    }));
  }, [nTrees, learningRate]);

  const lossCurve = useMemo(() => {
    return TREE_PREDICTIONS.map((_, i) => {
      const loss = DATA.reduce((acc, p) => {
        const err = p.y - ensemblePrediction(p.x, i + 1, learningRate);
        return acc + err * err;
      }, 0) / DATA.length;
      return { trees: i + 1, loss };
    });
  }, [learningRate]);

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-sm">Trees: {nTrees}</div>
        <input
          type="range"
          min={1}
          max={TREE_PREDICTIONS.length}
          value={nTrees}
          onChange={e => setNTrees(Number(e.target.value))}
          className="flex-1"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm">Learning rate: {learningRate.toFixed(2)}</div>
        <input
          type="range"
          min={0.05}
          max={1}
          step={0.05}
          value={learningRate}
          onChange={e => setLearningRate(Number(e.target.value))}
          className="flex-1"
        />
      </div>

      <motion.div
        key={`${nTrees}-${learningRate}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="h-72"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis type="number" dataKey="x" domain={[0, 1]} />
            <YAxis type="number" domain={[0, 4]} />
            <Tooltip />
            <Scatter data={DATA} fill="var(--color-accent)" />
            <Line
              type="monotone"
              dataKey="y"
              data={curveData}
              stroke="var(--color-text)"
              strokeWidth={2}
              dot={false}
            />
            {residuals.map((r, i) => (
              <Line
                key={i}
                data={[{ x: r.x, y: r.yHat }, { x: r.x, y: r.y }]}
                dataKey="y"
                stroke="var(--color-text-secondary)"
                dot={false}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={lossCurve}>
            <XAxis dataKey="trees" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="loss" stroke="var(--color-accent)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="text-sm text-text-secondary">
        Gray lines show residuals; curve is ensemble prediction.
      </div>
    </div>
  );
}
