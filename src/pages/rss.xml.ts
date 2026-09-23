import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const pages = await getCollection('wiki', ({ data }) => !data.draft);
  const items = pages
    .filter(page => page.data.date)
    .sort((a, b) => b.data.date!.getTime() - a.data.date!.getTime());

  return rss({
    title: 'AIpedia',
    description: 'The AI Encyclopedia: time-tested papers, software, interviews, positions, demos, and blogs, each explained with an interactive demo',
    site: context.site ?? 'https://aipedia.org',
    items: items.map(page => ({
      title: page.data.title,
      description: page.data.description,
      link: `/${page.slug}/`,
      pubDate: page.data.date,
      categories: page.data.tags,
    })),
  });
}
