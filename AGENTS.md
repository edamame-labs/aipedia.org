# aipedia.org - AI Agent Instructions

## Quick Commands

```bash
bun dev            # Start dev server (port 4321)
bun run build      # Build for production
bun run thumbs     # Capture card previews (dev server must be running)
npx tsc --noEmit   # Typecheck (should report zero errors)
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
3. Import React components with `client:visible` for interactivity
4. Run `bun run thumbs topic-name` to capture the card preview

## File Naming

- Pages: `kebab-case.mdx`
- Components: `PascalCase.tsx`

## Conventions that matter

- **Hydrate with `client:visible`, not `client:load`.** Most visualizations sit
  below the fold; deferring them keeps React off the critical path.
- **Never call `Math.random()` on a React render path.** Astro server-renders
  every island and renders it more than once per build, so random values differ
  between the server HTML and the browser's first render and React throws the
  whole island away (hydration error #418). Use `createRng(seed)` from
  `src/lib/rng.ts`, created *inside* the function that draws from it. Randomness
  inside effects, intervals and click handlers runs after hydration, so plain
  `Math.random()` is correct there.
- **Import `src/lib/motion.ts` in any component that animates.** It switches
  Framer Motion off for visitors who ask for reduced motion; the CSS media query
  in `global.css` only reaches CSS transitions.
- **Don't add third-party stylesheet or font CDNs.** KaTeX and the web fonts are
  bundled from `node_modules` — without its stylesheet KaTeX expands the page to
  several thousand pixels wide, so a CDN outage is a broken site.
- **Keep React off the home page.** The index (`src/components/EntryIndex.astro`)
  renders its cards on the server and filters them with plain TypeScript
  (`src/scripts/entry-index.ts`).
- Keep `--color-text-secondary` at or above 4.5:1 against both `--color-bg` and
  `--color-bg-secondary` in each theme.

## Layout

- `src/layouts/Base.astro` — shell, metadata, ⌘K search dialog, theme toggle
- `src/layouts/WikiPage.astro` — entry page: breadcrumb, infobox with facts and resources, TOC, related entries
- Page width is `max-w-7xl`; article text is held to 68ch in `global.css`, while demos, tables and code use the full column
- Search is plain TypeScript (`src/scripts/search.ts` + `src/lib/search.ts`) and
  fetches `/search-index.json` on first use, so no page ships React just to search
