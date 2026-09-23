import { useState } from 'react';
import { motion } from 'framer-motion';
import '../../lib/motion';

interface Module {
  id: number;
  title: string;
  topics: string[];
  icon: string;
}

const MODULES: Module[] = [
  {
    id: 1,
    title: 'Image Classification',
    topics: ['k-NN', 'Linear classifiers', 'Loss functions', 'Optimization'],
    icon: '🖼️',
  },
  {
    id: 2,
    title: 'Neural Networks',
    topics: ['Backpropagation', 'Activation functions', 'Initialization', 'Regularization'],
    icon: '🧠',
  },
  {
    id: 3,
    title: 'CNNs',
    topics: ['Convolution', 'Pooling', 'Architectures', 'AlexNet/VGG/ResNet'],
    icon: '📊',
  },
  {
    id: 4,
    title: 'Training',
    topics: ['SGD/Adam', 'Batch normalization', 'Hyperparameter tuning', 'Data augmentation'],
    icon: '⚡',
  },
  {
    id: 5,
    title: 'Detection & Segmentation',
    topics: ['R-CNN', 'YOLO', 'Semantic segmentation', 'Instance segmentation'],
    icon: '🎯',
  },
  {
    id: 6,
    title: 'Generative Models',
    topics: ['VAEs', 'GANs', 'Autoregressive models', 'Diffusion'],
    icon: '🎨',
  },
];

const KEY_CONCEPTS = [
  { name: 'Forward Pass', desc: 'Compute output from input through layers' },
  { name: 'Backward Pass', desc: 'Compute gradients via chain rule' },
  { name: 'Loss Function', desc: 'Measures prediction vs ground truth' },
  { name: 'Gradient Descent', desc: 'Update weights to minimize loss' },
];

export function CS231nViz() {
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [hoveredConcept, setHoveredConcept] = useState<string | null>(null);

  return (
    <div className="p-6 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">CS231n Course Overview</h3>
        <a
          href="https://cs231n.stanford.edu/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent hover:underline"
        >
          cs231n.stanford.edu →
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {MODULES.map((module, i) => (
          <motion.div
            key={module.id}
            className={`p-3 bg-bg rounded-lg border cursor-pointer ${
              selectedModule === module.id ? 'border-accent' : 'border-border'
            }`}
            onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{module.icon}</span>
              <span className="text-sm font-medium">{module.title}</span>
            </div>
            {selectedModule === module.id && (
              <motion.ul
                className="text-xs text-text-secondary space-y-1"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                {module.topics.map((topic) => (
                  <li key={topic} className="flex items-center gap-1">
                    <span className="text-accent">•</span> {topic}
                  </li>
                ))}
              </motion.ul>
            )}
          </motion.div>
        ))}
      </div>

      <div className="bg-bg rounded-lg border border-border p-4 mb-6">
        <div className="text-sm font-medium mb-3">Core Training Loop</div>
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {KEY_CONCEPTS.map((concept, i) => (
            <motion.div
              key={concept.name}
              className={`flex-1 min-w-[100px] p-2 rounded-lg text-center cursor-pointer ${
                hoveredConcept === concept.name
                  ? 'bg-accent/20 border border-accent'
                  : 'bg-bg-secondary border border-transparent'
              }`}
              onMouseEnter={() => setHoveredConcept(concept.name)}
              onMouseLeave={() => setHoveredConcept(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-xs font-medium">{concept.name}</div>
              {hoveredConcept === concept.name && (
                <motion.div
                  className="text-xs text-text-secondary mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {concept.desc}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        <div className="flex justify-center mt-2">
          <svg width="300" height="20">
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <path d="M0,0 L0,6 L9,3 z" fill="rgb(99, 102, 241)" />
              </marker>
            </defs>
            <line x1="20" y1="10" x2="280" y2="10" stroke="rgb(99, 102, 241)" strokeWidth="2" markerEnd="url(#arrow)" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-2">Prerequisites</div>
          <ul className="text-xs text-text-secondary space-y-1">
            <li>• Linear algebra (matrices, vectors)</li>
            <li>• Calculus (derivatives, chain rule)</li>
            <li>• Probability basics</li>
            <li>• Python/NumPy</li>
          </ul>
        </div>
        <div className="p-3 bg-bg rounded-lg border border-border">
          <div className="text-sm font-medium mb-2">Assignments</div>
          <ul className="text-xs text-text-secondary space-y-1">
            <li>• Image classification pipeline</li>
            <li>• Neural network from scratch</li>
            <li>• CNN architectures</li>
            <li>• GANs and style transfer</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
