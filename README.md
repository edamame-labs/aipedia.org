# AIpedia.org

⚠️ **Disclaimer**: Content is AI-generated offline with minimal human editing and supervision. Use with caution and verify information independently.

---

The AI Encyclopedia: a growing collection of time-tested cool things in AI (papers, software, interviews, positions, demos, blogs), the things worth knowing on the way into the singularity. Each entry has an interactive demo, a plain-language explanation, and links to the originals.

## Quick Start

```bash
bun install
bun dev
```

Visit `http://localhost:4321`

## Adding an Entry

1. Create `src/content/wiki/<slug>.mdx`:

   ```mdx
   ---
   title: "Attention Is All You Need"
   description: "The 2017 paper that introduced the Transformer architecture"
   category: "paper"          # paper | concept | software | interview | position | demo | blog | product | misc
   by: "Vaswani et al."
   year: 2017                 # when the original work came out
   date: 2026-02-26           # when the entry was added
   tags: ["attention", "nlp", "transformer"]
   resources:                 # first one is the primary source
     - kind: paper            # paper | code | article | video | course | book | docs
       title: "Attention Is All You Need"
       url: "https://arxiv.org/abs/1706.03762"
       note: "Vaswani et al., 2017"
   ---

   import { MyViz } from '../../components/viz/MyViz';

   <MyViz client:load />
   ```

2. Build the visualization in `src/components/viz/`.
3. With the dev server running, capture the card preview: `bun run thumbs <slug>`
   (uses your installed Google Chrome and writes light and dark previews to `public/thumbs/`).

## For AI

AIpedia is meant to be shared with AI models too:

- `/llms.txt`: an index of every entry ([llmstxt.org](https://llmstxt.org))
- `/llms-full.txt`: every entry in one Markdown file
- `/<slug>.md`: a single entry as Markdown

Entry pages also have "Copy as Markdown", "Ask Claude", and "Ask ChatGPT" links.

## Tech Stack

- **Astro** - Static site generator
- **React** - Interactive components
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Charts

## Structure

```
src/
├── content/wiki/     # MDX entries
├── components/viz/   # Interactive visualizations
├── components/       # Index and card components
├── lib/              # Collection helpers and labels
├── layouts/          # Page templates
└── pages/            # Routes
scripts/              # Preview capture
public/thumbs/        # Card previews
```

## License

MIT
