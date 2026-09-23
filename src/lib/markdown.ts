// Plain-Markdown versions of entries, for sharing AIpedia with AI models.
import type { Entry } from './catalog';
import { CATEGORY_LABELS, CATEGORY_ORDER, RESOURCE_LABELS, tagLabel } from './labels';

export const SUMMARY =
  'The AI Encyclopedia: a growing collection of time-tested cool things in AI (papers, software, interviews, ' +
  'positions, demos, and blogs), the things worth knowing on the way into the singularity. Each entry has a ' +
  'plain-language explanation, an interactive demo on the website, and links to the originals.';

/** Site origin without a trailing slash */
export function siteOrigin(site: URL | undefined): string {
  return (site?.href ?? 'https://aipedia.org/').replace(/\/$/, '');
}

/** Entries grouped by type (in display order), oldest work first within each type */
export function byTypeThenYear(entries: Entry[]): Entry[] {
  return [...entries].sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.data.category) - CATEGORY_ORDER.indexOf(b.data.category) ||
      (a.data.year ?? Infinity) - (b.data.year ?? Infinity) ||
      a.data.title.localeCompare(b.data.title)
  );
}

/** The MDX body as Markdown: imports dropped, demos linked, site links made absolute */
function bodyMarkdown(entry: Entry, origin: string): string {
  const lines: string[] = [];
  let inCode = false;
  for (const line of entry.body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inCode = !inCode;
      lines.push(line);
    } else if (inCode) {
      lines.push(line);
    } else if (/^import\s.+\sfrom\s/.test(line)) {
      continue;
    } else if (/^\s*<[A-Z][\w.]*\b[^>]*\/>\s*$/.test(line)) {
      lines.push(`*Interactive demo: ${origin}/${entry.slug}*`);
    } else {
      lines.push(line.replace(/\]\(\/(?!\/)/g, `](${origin}/`));
    }
  }
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function entryMarkdown(entry: Entry, origin: string): string {
  const { data, slug } = entry;
  const facts = [
    `- Type: ${CATEGORY_LABELS[data.category].one}`,
    data.by ? `- By: ${data.by}` : null,
    data.year ? `- Year: ${data.year}` : null,
    data.tags.length ? `- Topics: ${data.tags.map(tagLabel).join(', ')}` : null,
    `- Page: ${origin}/${slug}`,
  ].filter((line) => line !== null);
  const resources = data.resources.map(
    (r) => `- [${r.title}](${r.url}): ${RESOURCE_LABELS[r.kind]}${r.note ? `, ${r.note}` : ''}`
  );

  return [
    `# ${data.title}`,
    '',
    `> ${data.description}`,
    '',
    ...facts,
    ...(resources.length ? ['', '## Resources', '', ...resources] : []),
    '',
    bodyMarkdown(entry, origin),
    '',
  ].join('\n');
}

/** Links that open a chat with the prompt filled in */
export function askAILinks(prompt: string): { label: string; href: string }[] {
  const q = encodeURIComponent(prompt);
  return [
    { label: 'Ask Claude', href: `https://claude.ai/new?q=${q}` },
    { label: 'Ask ChatGPT', href: `https://chatgpt.com/?q=${q}` },
  ];
}

export function markdownResponse(body: string, type = 'text/markdown'): Response {
  return new Response(body, { headers: { 'Content-Type': `${type}; charset=utf-8` } });
}
