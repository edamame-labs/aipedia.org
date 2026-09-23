# aipedia.org - AI Agent Instructions

## Quick Commands

```bash
bun dev          # Start dev server (port 4321)
bun run build    # Build for production
bun run thumbs   # Capture card previews (dev server must be running)
```

## Content

- Entries: `src/content/wiki/*.mdx`
- Visualizations: `src/components/viz/*.tsx`
- Card previews: `public/thumbs/<slug>.webp` and `<slug>.dark.webp`
- Frontmatter schema: `src/content/config.ts`
  - Required: `title`, `description`, `category` (`paper` | `concept` | `software` | `interview` | `position` | `demo` | `blog` | `product` | `misc`)
  - Optional: `by`, `year` (of the original work), `date` (added), `tags`, `draft`
  - `resources`: list of `{ kind, title, url, note? }`; kinds are `paper`, `code`, `article`, `video`, `course`, `book`, `docs`. The first one is the primary source.

## For AI

- `/llms.txt`, `/llms-full.txt`, and `/<slug>.md` are generated from the entries (`src/pages/llms.txt.ts`, `src/pages/llms-full.txt.ts`, `src/pages/[slug].md.ts`, helpers in `src/lib/markdown.ts`)

## Adding Entries

1. Create `src/content/wiki/topic-name.mdx` with the frontmatter above
2. Put links to papers, code, and videos in `resources`, not in the body
3. Import React components with `client:load` for interactivity
4. Run `bun run thumbs topic-name` to capture the card preview

## File Naming

- Pages: `kebab-case.mdx`
- Components: `PascalCase.tsx`
