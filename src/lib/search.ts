export interface SearchEntry {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  /** Who made it, e.g. "Vaswani et al." */
  by?: string;
}

export interface ScoredEntry extends SearchEntry {
  score: number;
}

/**
 * Ranked match over the page index. Substring matching alone put "Attention Is
 * All You Need" below unrelated pages that merely mentioned attention in their
 * description, so matches are weighted by where they land: a title that starts
 * with the query beats a title that contains it, which beats a tag, which beats
 * a description.
 */
export function searchPages(pages: SearchEntry[], rawQuery: string): ScoredEntry[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];
  const terms = query.split(/\s+/);

  return pages
    .map(page => {
      const title = page.title.toLowerCase();
      const description = page.description.toLowerCase();
      const tags = page.tags.map(tag => tag.toLowerCase());
      const by = page.by?.toLowerCase() ?? '';

      let score = 0;
      for (const term of terms) {
        let termScore = 0;
        if (title === term) termScore = 100;
        else if (title.startsWith(term)) termScore = 60;
        else if (new RegExp(`\\b${escapeRegExp(term)}`).test(title)) termScore = 40;
        else if (title.includes(term)) termScore = 25;
        else if (tags.some(tag => tag === term)) termScore = 20;
        else if (tags.some(tag => tag.includes(term))) termScore = 12;
        else if (by.includes(term)) termScore = 10;
        else if (description.includes(term)) termScore = 6;
        else if (page.slug.includes(term)) termScore = 4;

        // every term has to land somewhere, so "attention paper" does not match
        // a page that only knows about attention
        if (termScore === 0) return { ...page, score: 0 };
        score += termScore;
      }

      // nudge shorter titles up: they are usually the canonical page for a term
      return { ...page, score: score - title.length * 0.01 };
    })
    .filter(page => page.score > 0)
    .sort((a, b) => b.score - a.score);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
