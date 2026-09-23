// Server-only helpers for turning the content collection into index data.
import { getCollection, type CollectionEntry } from 'astro:content';
import fs from 'node:fs';
import path from 'node:path';
import { BROAD_TAGS, byNewest, type Item } from './labels';

export type Entry = CollectionEntry<'wiki'>;

/** A path through the fundamentals, shown on the home page */
export const START_HERE = [
  { slug: 'backpropagation', label: 'Backpropagation' },
  { slug: 'understanding-lstms', label: 'LSTMs' },
  { slug: 'seq2seq', label: 'Seq2seq' },
  { slug: 'bahdanau-attention', label: 'Attention' },
  { slug: 'transformer', label: 'Transformers' },
  { slug: 'gpt', label: 'GPT' },
  { slug: 'reinforcement-learning', label: 'Reinforcement learning' },
  { slug: 'policy-gradient', label: 'Policy gradients' },
];

const THUMB_DIR = path.join(process.cwd(), 'public', 'thumbs');

function readingMinutes(body: string): number {
  const prose = body
    .replace(/^import .*$/gm, '')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function thumbPath(file: string): string | undefined {
  return fs.existsSync(path.join(THUMB_DIR, file)) ? `/thumbs/${file}` : undefined;
}

export function toItem(entry: Entry): Item {
  const { slug, data, body } = entry;
  return {
    slug,
    title: data.title,
    description: data.description,
    category: data.category,
    by: data.by,
    year: data.year,
    tags: data.tags,
    added: data.date?.toISOString().slice(0, 10),
    resources: data.resources,
    minutes: readingMinutes(body),
    thumb: thumbPath(`${slug}.webp`),
    thumbDark: thumbPath(`${slug}.dark.webp`),
    interactive: /client:(load|idle|visible|only)/.test(body),
  };
}

export async function getEntries(): Promise<Entry[]> {
  return getCollection('wiki', ({ data }) => import.meta.env.DEV || !data.draft);
}

export async function getItems(): Promise<Item[]> {
  const entries = await getEntries();
  return entries.map(toItem).sort(byNewest);
}

export interface TopicCount {
  tag: string;
  count: number;
}

export function topicCounts(items: Item[], { includeBroad = false } = {}): TopicCount[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.tags) {
      if (!includeBroad && BROAD_TAGS.has(tag)) continue;
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Entries sharing the most specific topics with `item` */
export function relatedItems(item: Item, items: Item[], limit = 3): Item[] {
  const topics = new Set(item.tags.filter((t) => !BROAD_TAGS.has(t)));
  return items
    .filter((other) => other.slug !== item.slug)
    .map((other) => ({
      other,
      shared: other.tags.filter((t) => topics.has(t)).length,
    }))
    .filter(({ shared }) => shared > 0)
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        Number(b.other.category === item.category) - Number(a.other.category === item.category) ||
        byNewest(a.other, b.other)
    )
    .slice(0, limit)
    .map(({ other }) => other);
}
