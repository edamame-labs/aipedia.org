/**
 * Deterministic pseudo-random number generator (mulberry32).
 *
 * Visualizations are server-rendered by Astro and then hydrated in the browser.
 * `Math.random()` returns different values in each pass, so React finds markup
 * it did not expect, throws away the server HTML and re-renders the whole
 * island (hydration error #418). Seeding the generator makes both passes agree
 * while the output still looks random.
 *
 * Use this for anything generated on the render path. Randomness inside event
 * handlers and effects runs only after hydration, so `Math.random()` is fine
 * there — and is what you want when a control is meant to resample.
 */
export function createRng(seed: number) {
  let state = seed >>> 0 || 1;
  return function random(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
