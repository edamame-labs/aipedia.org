import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';
import { createRng } from '../../lib/rng';

interface ParamDataPoint {
  params: number;
  loss: number;
}

interface ComputeDataPoint {
  compute: number;
  loss: number;
}

const generateScalingData = (): ParamDataPoint[] => {
  const random = createRng(15733);
  const data: ParamDataPoint[] = [];
  for (let i = 0; i < 20; i++) {
    const params = Math.pow(10, 6 + i * 0.4);
    const loss = 10.5 * Math.pow(params, -0.076) + 0.1 * random();
    data.push({ params, loss });
  }
  return data;
};

const generateComputeData = (): ComputeDataPoint[] => {
  const random = createRng(48091);
  const data: ComputeDataPoint[] = [];
  for (let i = 0; i < 20; i++) {
    const compute = Math.pow(10, 15 + i * 0.5);
    const loss = 2.8 * Math.pow(compute, -0.050) + 0.05 * random();
    data.push({ compute, loss });
  }
  return data;
};

type View = 'params' | 'compute' | 'optimal';

export function ScalingLawsViz() {
  const [view, setView] = useState<View>('params');
  
  const paramsData = useMemo(() => generateScalingData(), []);
  const computeData = useMemo(() => generateComputeData(), []);

  const chartWidth = 300;
  const chartHeight = 200;
  const padding = 40;

  const renderParamsChart = () => {
    const minLoss = Math.min(...paramsData.map(d => d.loss));
    const maxLoss = Math.max(...paramsData.map(d => d.loss));
    const minParams = Math.min(...paramsData.map(d => d.params));
    const maxParams = Math.max(...paramsData.map(d => d.params));

    return (
      <svg width={chartWidth + padding * 2} height={chartHeight + padding * 2}>
        <text x={padding + chartWidth / 2} y={chartHeight + padding + 35} textAnchor="middle" fill="rgb(156, 163, 175)" fontSize="12">
          Parameters (log scale)
        </text>
        <text x={15} y={padding + chartHeight / 2} textAnchor="middle" fill="rgb(156, 163, 175)" fontSize="12" transform={`rotate(-90, 15, ${padding + chartHeight / 2})`}>
          Loss
        </text>
        
        {paramsData.map((d, i) => {
          const x = padding + (Math.log10(d.params) - Math.log10(minParams)) / (Math.log10(maxParams) - Math.log10(minParams)) * chartWidth;
          const y = padding + chartHeight - (d.loss - minLoss) / (maxLoss - minLoss) * chartHeight;
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={4}
              fill="rgb(99, 102, 241)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
            />
          );
        })}
        
        <motion.path
          d={`M ${padding} ${padding + chartHeight * 0.1} Q ${padding + chartWidth * 0.5} ${padding + chartHeight * 0.5} ${padding + chartWidth} ${padding + chartHeight * 0.85}`}
          fill="none"
          stroke="rgb(249, 115, 22)"
          strokeWidth="2"
          strokeDasharray="5,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        />
      </svg>
    );
  };

  const renderComputeChart = () => {
    const minLoss = Math.min(...computeData.map(d => d.loss));
    const maxLoss = Math.max(...computeData.map(d => d.loss));
    const minCompute = Math.min(...computeData.map(d => d.compute));
    const maxCompute = Math.max(...computeData.map(d => d.compute));

    return (
      <svg width={chartWidth + padding * 2} height={chartHeight + padding * 2}>
        <text x={padding + chartWidth / 2} y={chartHeight + padding + 35} textAnchor="middle" fill="rgb(156, 163, 175)" fontSize="12">
          Compute (FLOPs, log scale)
        </text>
        <text x={15} y={padding + chartHeight / 2} textAnchor="middle" fill="rgb(156, 163, 175)" fontSize="12" transform={`rotate(-90, 15, ${padding + chartHeight / 2})`}>
          Loss
        </text>
        
        {computeData.map((d, i) => {
          const x = padding + (Math.log10(d.compute) - Math.log10(minCompute)) / (Math.log10(maxCompute) - Math.log10(minCompute)) * chartWidth;
          const y = padding + chartHeight - (d.loss - minLoss) / (maxLoss - minLoss) * chartHeight;
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={4}
              fill="rgb(34, 197, 94)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
            />
          );
        })}
        
        <motion.path
          d={`M ${padding} ${padding + chartHeight * 0.1} Q ${padding + chartWidth * 0.5} ${padding + chartHeight * 0.5} ${padding + chartWidth} ${padding + chartHeight * 0.85}`}
          fill="none"
          stroke="rgb(249, 115, 22)"
          strokeWidth="2"
          strokeDasharray="5,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        />
      </svg>
    );
  };

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Neural Scaling Laws</h3>
      </div>

      <div className="flex gap-2 mb-6 justify-center">
        {[
          { key: 'params' as const, label: 'Parameters' },
          { key: 'compute' as const, label: 'Compute' },
          { key: 'optimal' as const, label: 'Optimal Allocation' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            className={`px-3 py-1 text-xs rounded-md border ${
              view === item.key
                ? 'border-accent text-accent bg-accent/10'
                : 'border-border text-text-secondary'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex justify-center mb-6 bg-bg rounded-lg border border-border p-4">
        {view === 'params' && renderParamsChart()}
        {view === 'compute' && renderComputeChart()}
        {view === 'optimal' && (
          <div className="text-center py-8">
            <div className="text-4xl font-bold text-accent mb-2">N* ∝ C^0.73</div>
            <div className="text-sm text-text-secondary mb-4">Optimal model size scales with compute^0.73</div>
            <div className="text-4xl font-bold text-green-500 mb-2">D* ∝ C^0.27</div>
            <div className="text-sm text-text-secondary">Optimal data scales with compute^0.27</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-bg rounded-lg border border-border text-center">
          <div className="text-lg font-bold text-accent">N^-0.076</div>
          <div className="text-xs text-text-secondary">Loss vs Parameters</div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border text-center">
          <div className="text-lg font-bold text-green-500">C^-0.050</div>
          <div className="text-xs text-text-secondary">Loss vs Compute</div>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border text-center">
          <div className="text-lg font-bold text-orange-500">D^-0.095</div>
          <div className="text-xs text-text-secondary">Loss vs Data</div>
        </div>
      </div>

      <div className="p-4 bg-bg rounded-lg border border-border">
        <div className="text-sm font-medium mb-2">Key Insight</div>
        <div className="text-xs text-text-secondary">
          Performance follows smooth power laws across many orders of magnitude.
          Given a compute budget, you can predict optimal model size and training data.
        </div>
      </div>
    </div>
  );
}
