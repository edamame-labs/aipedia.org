import { getCollection } from 'astro:content';
import type { SearchEntry } from '../lib/search';

/**
 * The index is fetched on first use rather than inlined into every page: it is
 * the same ~10KB on all 145 pages, and as its own file the browser downloads it
 * once and reuses it for the rest of the session.
 */
export async function GET() {
  const pages = await getCollection('wiki', ({ data }) => !data.draft);
  const index: SearchEntry[] = pages.map(page => ({
    slug: page.slug,
    title: page.data.title,
    description: page.data.description,
    tags: page.data.tags,
    by: page.data.by,
  }));

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
