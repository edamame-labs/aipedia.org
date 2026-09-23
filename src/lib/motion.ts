import { MotionGlobalConfig } from 'framer-motion';

/**
 * Honour the operating system's "reduce motion" setting across every
 * visualization. The CSS media query in global.css only reaches CSS
 * transitions and animations; Framer Motion drives its own values in
 * JavaScript, so it needs to be told separately.
 *
 * Imported for its side effect by each visualization that animates.
 */
if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  MotionGlobalConfig.skipAnimations = true;
}
