// Filtering, ordering, and URL state for the home page index (EntryIndex.astro).
// Cards are server-rendered; this only shows, hides, and reorders them.
import { byNewest } from '../lib/labels';
import { searchPages, type SearchEntry } from '../lib/search';

type Order = 'newest' | 'chronological' | 'az';
const ORDERS: readonly Order[] = ['newest', 'chronological', 'az'];

interface Entry extends SearchEntry {
  el: HTMLElement;
  category: string;
  year?: number;
  added?: string;
}

interface Labels {
  types: Record<string, { one: string; many: string }>;
  tags: Record<string, string>;
}

const compare: Record<Order, (a: Entry, b: Entry) => number> = {
  newest: byNewest,
  chronological: (a, b) => (a.year ?? Infinity) - (b.year ?? Infinity) || a.title.localeCompare(b.title),
  az: (a, b) => a.title.localeCompare(b.title),
};

function yearHeading(year: number | undefined, first: boolean): HTMLElement {
  const heading = document.createElement('h3');
  heading.className = first
    ? 'col-span-full font-mono text-[13px] text-text'
    : 'col-span-full mt-4 border-t border-border pt-6 font-mono text-[13px] text-text';
  heading.textContent = year ? String(year) : 'Undated';
  return heading;
}

function setup(root: HTMLElement) {
  const grid = root.querySelector<HTMLElement>('[data-index-grid]');
  const query = root.querySelector<HTMLInputElement>('[data-index-query]');
  const queryClear = root.querySelector<HTMLButtonElement>('[data-index-query-clear]');
  const kbd = root.querySelector<HTMLElement>('[data-index-kbd]');
  const orderSelect = root.querySelector<HTMLSelectElement>('[data-index-order]');
  const summary = root.querySelector<HTMLElement>('[data-index-summary]');
  const empty = root.querySelector<HTMLElement>('[data-index-empty]');
  const labelsScript = root.querySelector('[data-index-labels]');
  if (!grid || !query || !queryClear || !kbd || !orderSelect || !summary || !empty || !labelsScript) return;

  const labels: Labels = JSON.parse(labelsScript.textContent ?? '{}');
  const clearButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-index-clear]')];
  const summaryClear = clearButtons[0];
  const typeButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-type]')];
  const topicButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-topic]')];

  const entries: Entry[] = [...grid.querySelectorAll<HTMLElement>('[data-entry]')].map((el) => ({
    el,
    slug: el.dataset.slug ?? '',
    title: el.dataset.title ?? '',
    description: el.dataset.description ?? '',
    by: el.dataset.by,
    tags: (el.dataset.tags ?? '').split(' ').filter(Boolean),
    category: el.dataset.category ?? '',
    year: el.dataset.year ? Number(el.dataset.year) : undefined,
    added: el.dataset.added,
  }));

  const state = { q: '', type: '', topic: '', order: 'newest' as Order };

  // Filtered views can be linked to: /?type=paper&topic=nlp&q=attention&order=az
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const topic = params.get('topic');
  const order = params.get('order');
  state.q = params.get('q') ?? '';
  if (type && labels.types[type]) state.type = type;
  if (topic && labels.tags[topic]) state.topic = topic;
  if (order && (ORDERS as readonly string[]).includes(order)) state.order = order as Order;
  query.value = state.q;
  orderSelect.value = state.order;

  const describe = (n: number) => {
    const plural = n !== 1;
    let noun = plural ? 'entries' : 'entry';
    if (state.type) {
      const { one, many } = labels.types[state.type];
      // "3 papers", but "2 software entries"
      noun = one === many ? `${one.toLowerCase()} ${noun}` : (plural ? many : one).toLowerCase();
    }
    const q = state.q.trim();
    return [`${n} ${noun}`, state.topic && `in ${labels.tags[state.topic]}`, q && `matching “${q}”`]
      .filter(Boolean)
      .join(' ');
  };

  const render = () => {
    const q = state.q.trim();
    const scores = q ? new Map(searchPages(entries, q).map((match) => [match.slug, match.score])) : null;
    const visible = entries
      .filter(
        (entry) =>
          (!state.type || entry.category === state.type) &&
          (!state.topic || entry.tags.includes(state.topic)) &&
          (!scores || scores.has(entry.slug))
      )
      .sort((a, b) => (scores ? scores.get(b.slug)! - scores.get(a.slug)! : 0) || compare[state.order](a, b));

    const grouped = state.order === 'chronological' && !scores;
    const nodes: HTMLElement[] = [];
    visible.forEach((entry, i) => {
      if (grouped && (i === 0 || visible[i - 1].year !== entry.year)) nodes.push(yearHeading(entry.year, i === 0));
      entry.el.hidden = false;
      nodes.push(entry.el);
    });
    const shown = new Set(visible);
    for (const entry of entries) {
      if (shown.has(entry)) continue;
      entry.el.hidden = true;
      nodes.push(entry.el);
    }
    grid.replaceChildren(...nodes);

    grid.hidden = visible.length === 0;
    empty.hidden = visible.length > 0;
    typeButtons.forEach((button) => button.setAttribute('aria-pressed', String((button.dataset.type ?? '') === state.type)));
    topicButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.topic === state.topic)));

    const filtered = Boolean(q || state.type || state.topic);
    summary.textContent = filtered ? describe(visible.length) : `${entries.length} entries`;
    summaryClear.hidden = !filtered;
    queryClear.hidden = !state.q;
    kbd.hidden = Boolean(state.q);

    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (state.type) next.set('type', state.type);
    if (state.topic) next.set('topic', state.topic);
    if (state.order !== 'newest') next.set('order', state.order);
    const search = next.toString();
    window.history.replaceState(null, '', search ? `?${search}` : window.location.pathname);
  };

  typeButtons.forEach((button) =>
    button.addEventListener('click', () => {
      const value = button.dataset.type ?? '';
      state.type = value && value === state.type ? '' : value;
      render();
    })
  );
  topicButtons.forEach((button) =>
    button.addEventListener('click', () => {
      const value = button.dataset.topic ?? '';
      state.topic = value === state.topic ? '' : value;
      render();
    })
  );
  query.addEventListener('input', () => {
    state.q = query.value;
    render();
  });
  query.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !query.value) return;
    query.value = '';
    state.q = '';
    render();
  });
  queryClear.addEventListener('click', () => {
    query.value = '';
    state.q = '';
    render();
    query.focus();
  });
  orderSelect.addEventListener('change', () => {
    state.order = orderSelect.value as Order;
    render();
  });
  clearButtons.forEach((button) =>
    button.addEventListener('click', () => {
      query.value = '';
      Object.assign(state, { q: '', type: '', topic: '' });
      render();
    })
  );

  // "/" jumps to the filter box
  window.addEventListener('keydown', (event) => {
    if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
    if ((event.target as HTMLElement).closest('input, textarea, select, [contenteditable], dialog')) return;
    event.preventDefault();
    query.focus();
  });

  // The server renders the default view; only redo it for a linked-to filter
  if (state.q || state.type || state.topic || state.order !== 'newest') render();
}

document.querySelectorAll<HTMLElement>('[data-index]').forEach(setup);
