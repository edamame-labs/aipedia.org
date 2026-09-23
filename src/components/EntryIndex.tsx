import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { EntryCard } from './EntryCard';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  byNewest,
  tagLabel,
  type Category,
  type Item,
} from '../lib/labels';

type Order = 'newest' | 'chronological' | 'az';

const ORDERS: { id: Order; label: string }[] = [
  { id: 'newest', label: 'Recently added' },
  { id: 'chronological', label: 'Chronological' },
  { id: 'az', label: 'A–Z' },
];

const compare: Record<Order, (a: Item, b: Item) => number> = {
  newest: byNewest,
  chronological: (a, b) => (a.year ?? Infinity) - (b.year ?? Infinity) || a.title.localeCompare(b.title),
  az: (a, b) => a.title.localeCompare(b.title),
};

function countNoun(type: Category | null, n: number): string {
  const plural = n !== 1;
  const entries = plural ? 'entries' : 'entry';
  if (!type) return entries;
  const { one, many } = CATEGORY_LABELS[type];
  // "3 misc entries", "2 software entries"; otherwise "3 papers"
  if (one === many) return `${one.toLowerCase()} ${entries}`;
  return (plural ? many : one).toLowerCase();
}

/** Every search term must appear somewhere; title hits rank highest */
function relevance(item: Item, terms: string[]): number {
  let score = 0;
  for (const term of terms) {
    const inTitle = item.title.toLowerCase().includes(term);
    const inBy = item.by?.toLowerCase().includes(term) ?? false;
    const inTags = item.tags.some((tag) => tag.includes(term) || tagLabel(tag).toLowerCase().includes(term));
    const inDescription = item.description.toLowerCase().includes(term);
    if (!inTitle && !inBy && !inTags && !inDescription) return 0;
    score += (inTitle ? 4 : 0) + (inBy ? 2 : 0) + (inTags ? 2 : 0) + (inDescription ? 1 : 0);
  }
  return score;
}

interface Props {
  items: Item[];
  topics: { tag: string; count: number }[];
}

export function EntryIndex({ items, topics }: Props) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<Category | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [order, setOrder] = useState<Order>('newest');
  const [ready, setReady] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Restore filters from the URL so filtered views can be linked to
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const t = params.get('type');
    const tp = params.get('topic');
    const o = params.get('order');
    if (q) setQuery(q);
    if (t && (CATEGORIES as readonly string[]).includes(t)) setType(t as Category);
    if (tp && items.some((item) => item.tags.includes(tp))) setTopic(tp);
    if (o && ORDERS.some(({ id }) => id === o)) setOrder(o as Order);
    setReady(true);
  }, [items]);

  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (type) params.set('type', type);
    if (topic) params.set('topic', topic);
    if (order !== 'newest') params.set('order', order);
    const search = params.toString();
    window.history.replaceState(null, '', search ? `?${search}` : window.location.pathname);
  }, [ready, query, type, topic, order]);

  // "/" jumps to search
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.key !== '/' || event.metaKey || event.ctrlKey) return;
      if (target.closest('input, textarea, select, [contenteditable]')) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const typeCounts = useMemo(() => {
    const counts = new Map<Category, number>();
    for (const item of items) counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    return counts;
  }, [items]);

  const terms = useMemo(() => query.trim().toLowerCase().split(/\s+/).filter(Boolean), [query]);

  const results = useMemo(() => {
    const matches = items
      .filter((item) => (!type || item.category === type) && (!topic || item.tags.includes(topic)))
      .map((item) => ({ item, score: terms.length ? relevance(item, terms) : 1 }))
      .filter(({ score }) => score > 0);
    matches.sort((a, b) => (terms.length ? b.score - a.score : 0) || compare[order](a.item, b.item));
    return matches.map(({ item }) => item);
  }, [items, type, topic, order, terms]);

  const filtered = Boolean(terms.length || type || topic);
  const grouped = order === 'chronological' && !terms.length;

  const reset = () => {
    setQuery('');
    setType(null);
    setTopic(null);
  };

  const summary = [
    `${results.length} ${countNoun(type, results.length)}`,
    topic && `in ${tagLabel(topic)}`,
    terms.length > 0 && `matching “${query.trim()}”`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section aria-label="Index">
      <div className="flex flex-col-reverse gap-3 border-b border-border md:flex-row md:items-end md:justify-between">
        <div className="-mb-px flex gap-5 overflow-x-auto" role="group" aria-label="Type">
          <TypeTab label="All" count={items.length} active={!type} onClick={() => setType(null)} />
          {CATEGORY_ORDER.filter((c) => typeCounts.get(c)).map((c) => (
            <TypeTab
              key={c}
              label={CATEGORY_LABELS[c].many}
              count={typeCounts.get(c) ?? 0}
              active={type === c}
              onClick={() => setType(type === c ? null : c)}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 md:pb-3">
          <label className="relative flex flex-1 items-center md:flex-none">
            <span className="sr-only">Search entries</span>
            <svg
              className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-text-secondary"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5 14 14" strokeLinecap="round" />
            </svg>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setQuery('');
              }}
              placeholder="Search entries"
              className="h-8 w-full rounded-md border border-border bg-bg pl-8 pr-7 text-[13px] text-text outline-none transition-colors placeholder:text-text-secondary/70 focus:border-text-secondary md:w-56 [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  searchRef.current?.focus();
                }}
                className="absolute right-2 text-text-secondary hover:text-text"
                aria-label="Clear search"
              >
                <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                </svg>
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-2 hidden rounded border border-border px-1 font-mono text-[10px] leading-4 text-text-secondary md:block">
                /
              </kbd>
            )}
          </label>

          <label className="relative flex items-center">
            <span className="sr-only">Order</span>
            <select
              value={order}
              onChange={(event) => setOrder(event.target.value as Order)}
              className="h-8 appearance-none rounded-md border border-border bg-bg pl-2.5 pr-7 text-[13px] text-text-secondary outline-none transition-colors hover:text-text focus:border-text-secondary"
            >
              {ORDERS.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-2 h-3 w-3 text-text-secondary"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path d="M4.5 6.5 8 10l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </label>
        </div>
      </div>

      <nav
        aria-label="Topics"
        className="-mx-5 flex items-baseline gap-y-1.5 overflow-x-auto whitespace-nowrap px-5 py-4 text-[13px] leading-5 sm:mx-0 sm:flex-wrap sm:whitespace-normal sm:px-0"
      >
        <span className="mr-3 font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary">Topics</span>
        {topics.map(({ tag, count }, i) => (
          <Fragment key={tag}>
            {i > 0 && (
              <span className="mx-1.5 text-border" aria-hidden="true">
                /
              </span>
            )}
            <button
              type="button"
              aria-pressed={topic === tag}
              onClick={() => setTopic(topic === tag ? null : tag)}
              className={`transition-colors ${
                topic === tag ? 'font-medium text-text underline underline-offset-4' : 'text-text-secondary hover:text-text'
              }`}
            >
              {tagLabel(tag)}
              <span className="ml-1 font-mono text-[10.5px] tabular-nums opacity-60">{count}</span>
            </button>
          </Fragment>
        ))}
        <span className="mx-1.5 text-border" aria-hidden="true">
          /
        </span>
        <a href="/tags" className="text-text-secondary transition-colors hover:text-text">
          More&nbsp;&rarr;
        </a>
      </nav>

      <div className="mb-4 flex min-h-5 items-center gap-3 text-[13px] text-text-secondary" aria-live="polite">
        {filtered ? (
          <>
            <span>{summary}</span>
            <button type="button" onClick={reset} className="text-text underline-offset-4 hover:underline">
              Clear
            </button>
          </>
        ) : (
          <span>{items.length} entries</span>
        )}
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((item, i) => {
            const year = item.year ?? null;
            const newYear = grouped && (i === 0 || (results[i - 1].year ?? null) !== year);
            return (
              <Fragment key={item.slug}>
                {newYear && (
                  <h3
                    className={`col-span-full flex items-baseline gap-3 font-mono text-[13px] ${
                      i > 0 ? 'mt-4 border-t border-border pt-6' : ''
                    }`}
                  >
                    <span className="text-text">{year ?? 'Undated'}</span>
                  </h3>
                )}
                <EntryCard item={item} />
              </Fragment>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-[15px]">No entries match.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-2 text-[13px] text-text-secondary underline underline-offset-4 hover:text-text"
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}

function TypeTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 border-b-[1.5px] pb-3 text-[14px] transition-colors ${
        active ? 'border-text text-text' : 'border-transparent text-text-secondary hover:text-text'
      }`}
    >
      {label}
      <span className="ml-1.5 font-mono text-[11px] tabular-nums opacity-60">{count}</span>
    </button>
  );
}
