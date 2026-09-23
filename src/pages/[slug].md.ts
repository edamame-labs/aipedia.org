import type { APIRoute } from 'astro';
import { getEntries, type Entry } from '../lib/catalog';
import { entryMarkdown, markdownResponse, siteOrigin } from '../lib/markdown';

export async function getStaticPaths() {
  const entries = await getEntries();
  return entries.map((entry) => ({ params: { slug: entry.slug }, props: { entry } }));
}

export const GET: APIRoute = ({ props, site }) => {
  const { entry } = props as { entry: Entry };
  return markdownResponse(entryMarkdown(entry, siteOrigin(site)));
};
