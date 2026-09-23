// Shared types, labels, and formatting helpers. Safe to import from React islands
// (no Node or astro:content imports here — those live in catalog.ts).

export const REPO_URL = 'https://github.com/edamame-labs/aipedia.org';

export const CATEGORIES = [
  'paper',
  'concept',
  'software',
  'interview',
  'position',
  'demo',
  'blog',
  'product',
  'misc',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const RESOURCE_KINDS = ['paper', 'code', 'article', 'video', 'course', 'book', 'docs'] as const;
export type ResourceKind = (typeof RESOURCE_KINDS)[number];

export interface Resource {
  kind: ResourceKind;
  title: string;
  url: string;
  note?: string;
}

/** A collection entry flattened into plain data for cards and islands. */
export interface Item {
  slug: string;
  title: string;
  description: string;
  category: Category;
  by?: string;
  year?: number;
  tags: string[];
  /** ISO date (YYYY-MM-DD) the page was added */
  added?: string;
  resources: Resource[];
  minutes: number;
  /** Public paths of the preview images, if they have been captured */
  thumb?: string;
  thumbDark?: string;
  interactive: boolean;
}

export const CATEGORY_LABELS: Record<Category, { one: string; many: string }> = {
  paper: { one: 'Paper', many: 'Papers' },
  concept: { one: 'Concept', many: 'Concepts' },
  software: { one: 'Software', many: 'Software' },
  interview: { one: 'Interview', many: 'Interviews' },
  position: { one: 'Position', many: 'Positions' },
  demo: { one: 'Demo', many: 'Demos' },
  blog: { one: 'Blog', many: 'Blogs' },
  product: { one: 'Product', many: 'Products' },
  misc: { one: 'Misc', many: 'Misc' },
};

/** Display order for category filters (the schema's order) */
export const CATEGORY_ORDER: readonly Category[] = CATEGORIES;

export const RESOURCE_LABELS: Record<ResourceKind, string> = {
  paper: 'Paper',
  code: 'Code',
  article: 'Article',
  video: 'Video',
  course: 'Course',
  book: 'Book',
  docs: 'Docs',
};

/** Tags too broad to be useful as filters or for finding related pages */
export const BROAD_TAGS = new Set(['deep-learning', 'machine-learning']);

const TAG_LABELS: Record<string, string> = {
  agi: 'AGI',
  aixi: 'AIXI',
  cnn: 'CNNs',
  'computer-vision': 'Vision',
  ctc: 'CTC',
  gnn: 'GNNs',
  lstm: 'LSTMs',
  mdl: 'MDL',
  nlp: 'NLP',
  'policy-gradient': 'Policy gradients',
  'reinforcement-learning': 'Reinforcement learning',
  rnn: 'RNNs',
  seq2seq: 'Seq2seq',
  transformer: 'Transformers',
  vae: 'VAEs',
  'visual-qa': 'Visual QA',
};

export function tagLabel(tag: string): string {
  if (TAG_LABELS[tag]) return TAG_LABELS[tag];
  const words = tag.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const SOURCE_LABELS: Record<string, string> = {
  'arxiv.org': 'arXiv',
  'cdn.openai.com': 'OpenAI',
  'colah.github.io': "colah's blog",
  'cs.toronto.edu': 'U of Toronto',
  'cs231n.stanford.edu': 'Stanford',
  'distill.pub': 'Distill',
  'doi.org': 'DOI',
  'huggingface.co': 'Hugging Face',
  'jalammar.github.io': 'Jay Alammar',
  'jmlr.org': 'JMLR',
  'jstor.org': 'JSTOR',
  'lilianweng.github.io': "Lil'Log",
  'nature.com': 'Nature',
  'nlp.seas.harvard.edu': 'Harvard NLP',
  'nlp.stanford.edu': 'Stanford NLP',
  'openaccess.thecvf.com': 'CVF',
  'papers.nips.cc': 'NeurIPS',
  'primeintellect.ai': 'Prime Intellect',
  'proceedings.mlr.press': 'PMLR',
  'proceedings.neurips.cc': 'NeurIPS',
  'scottaaronson.blog': 'Shtetl-Optimized',
  'spinningup.openai.com': 'Spinning Up',
  'youtube.com': 'YouTube',
};

/** Short "where it lives" label: "arXiv", "karpathy/micrograd", "Nature", … */
export function sourceLabel(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    const host = hostname.replace(/^www\./, '');
    if (host === 'github.com') {
      const [owner, repo] = pathname.split('/').filter(Boolean);
      return repo ? `${owner}/${repo}` : owner ?? host;
    }
    return SOURCE_LABELS[host] ?? host;
  } catch {
    return url;
  }
}

/** Newest additions first; ties broken by the newer work, then title */
export function byNewest(a: Pick<Item, 'added' | 'year' | 'title'>, b: Pick<Item, 'added' | 'year' | 'title'>): number {
  return (
    (b.added ?? '').localeCompare(a.added ?? '') ||
    (b.year ?? 0) - (a.year ?? 0) ||
    a.title.localeCompare(b.title)
  );
}

/** The first resource of each kind, in the author's order: one link per "Paper", "Code", … */
export function quickLinks(resources: Resource[], max = 3): Resource[] {
  const seen = new Set<ResourceKind>();
  const links: Resource[] = [];
  for (const resource of resources) {
    if (seen.has(resource.kind)) continue;
    seen.add(resource.kind);
    links.push(resource);
  }
  return links.slice(0, max);
}
