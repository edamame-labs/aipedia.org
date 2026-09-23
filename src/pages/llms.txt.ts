// An index of AIpedia for language models (https://llmstxt.org)
import type { APIRoute } from 'astro';
import { getEntries } from '../lib/catalog';
import { CATEGORY_LABELS } from '../lib/labels';
import { SUMMARY, byTypeThenYear, markdownResponse, siteOrigin } from '../lib/markdown';

export const GET: APIRoute = async ({ site }) => {
  const origin = siteOrigin(site);
  const lines = [
    '# AIpedia',
    '',
    `> ${SUMMARY}`,
    '',
    `Each link below is a Markdown version of an entry. Everything in one file: ${origin}/llms-full.txt`,
  ];

  let section = '';
  for (const { slug, data } of byTypeThenYear(await getEntries())) {
    const heading = CATEGORY_LABELS[data.category].many;
    if (heading !== section) {
      section = heading;
      lines.push('', `## ${heading}`, '');
    }
    const credit = [data.by, data.year].filter(Boolean).join(', ');
    lines.push(`- [${data.title}](${origin}/${slug}.md): ${data.description}${credit ? ` (${credit})` : ''}`);
  }

  lines.push('', '## Optional', '', `- [All entries](${origin}/llms-full.txt): every entry in full, in one file`, '');
  return markdownResponse(lines.join('\n'), 'text/plain');
};
