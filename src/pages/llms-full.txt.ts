// Every AIpedia entry in one Markdown file, for language models
import type { APIRoute } from 'astro';
import { getEntries } from '../lib/catalog';
import { SUMMARY, byTypeThenYear, entryMarkdown, markdownResponse, siteOrigin } from '../lib/markdown';

export const GET: APIRoute = async ({ site }) => {
  const origin = siteOrigin(site);
  const entries = byTypeThenYear(await getEntries());
  const header = `# AIpedia\n\n> ${SUMMARY}\n\nSource: ${origin}. ${entries.length} entries follow.\n`;
  return markdownResponse([header, ...entries.map((entry) => entryMarkdown(entry, origin))].join('\n\n'), 'text/plain');
};
