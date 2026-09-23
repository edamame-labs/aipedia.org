# Contributing to aipedia.org

First off, thank you for considering contributing to aipedia.org! 🎉

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Getting Started](#getting-started)
- [Content Guidelines](#content-guidelines)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)

## Code of Conduct

This project follows a standard Code of Conduct. By participating, you agree to uphold a welcoming, inclusive environment.

## Ways to Contribute

### 📝 Add Content
- **Concepts**: Explain AI/ML concepts with interactive examples
- **Papers**: Summarize research papers with demos
- **Tutorials**: Create learning paths for beginners

### 🐛 Report Issues
- Found an error? [Open an issue](https://github.com/edamame-labs/aipedia.org/issues)
- Suggest improvements or new topics

### 💻 Improve Code
- Build new interactive components
- Fix bugs or improve performance
- Enhance the user experience

### 📖 Improve Documentation
- Fix typos or clarify explanations
- Add examples or diagrams
- Translate content

## Getting Started

### Prerequisites
```bash
# Install bun (recommended)
curl -fsSL https://bun.sh/install | bash
```

### Setup
```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/aipedia.org.git
cd aipedia.org

# Install dependencies
bun install

# Start development server
bun start
```

### Creating a Branch
```bash
# Create a branch for your changes
git checkout -b feature/your-feature-name
# or
git checkout -b content/concept-name
# or
git checkout -b fix/bug-description
```

## Content Guidelines

### File Naming
- Use `kebab-case` for all files (e.g., `attention-is-all-you-need.mdx`)

### Frontmatter
Every entry needs frontmatter (the schema lives in `src/content/config.ts`):

```yaml
---
title: "Your Title"
description: "One line shown on the card and in search results"
category: "paper"        # paper | concept | software | interview | position | demo | blog | product | misc
by: "Vaswani et al."     # optional: who made it
year: 2017               # optional: when the original work came out
date: 2026-02-26         # when the entry was added
tags: ["attention", "nlp"]
resources:               # the first one is the primary source
  - kind: paper          # paper | code | article | video | course | book | docs
    title: "Attention Is All You Need"
    url: "https://arxiv.org/abs/1706.03762"
    note: "Vaswani et al., 2017"
---
```

Links to papers, code, and videos belong in `resources` rather than in the body: they are shown on the entry's card and in its infobox.

### Card Previews
With the dev server running, `bun run thumbs your-entry` captures the entry's visualization in light and dark into `public/thumbs/` (it uses your installed Google Chrome).

### Content Structure

#### For Concepts
1. **Introduction** - What and why
2. **Intuition** - Simple explanation
3. **Interactive Demo** - Let readers explore
4. **Technical Details** - How it works
5. **Code Example** - Implementation
6. **Resources** - Papers, code, and videos in the frontmatter

#### For Papers
1. **TL;DR** - One paragraph summary
2. **Problem** - What problem it solves
3. **Key Idea** - Core contribution
4. **Demo** - Interactive exploration (if possible)
5. **Method** - Technical details
6. **Impact** - Why it matters

### Writing Tips
- ✅ Use clear, simple language
- ✅ Explain jargon when first used
- ✅ Add visuals and interactive elements
- ✅ Include "Why this matters" sections
- ✅ Link to related aipedia pages
- ❌ Don't assume advanced knowledge
- ❌ Don't use jargon without explanation

## Pull Request Process

### Before Submitting
1. [ ] Test your changes locally (`bun start`)
2. [ ] Capture the card preview (`bun run thumbs your-entry`)
3. [ ] Build successfully (`bun run build`)
4. [ ] Preview in both light and dark mode

### Submitting
1. Push your changes to your fork
2. Open a Pull Request against `main`
3. Fill out the PR template
4. Wait for review

### PR Title Format
```
type(scope): description

Examples:
- content(concepts): add transformer architecture page
- content(papers): add attention is all you need summary
- feat(components): add interactive attention demo
- fix(styles): fix dark mode contrast
- docs: update contribution guidelines
```

### After Review
- Address feedback promptly
- Request re-review after changes
- Squash commits if requested

## Style Guide

### Markdown/MDX
- Use ATX-style headers (`#`, `##`, `###`)
- One sentence per line for easier diffs
- Use fenced code blocks with language tags

### Code
- TypeScript for all components
- Use functional components with hooks
- Include JSDoc comments for public APIs
- Style with Tailwind classes and the theme tokens in `src/styles/global.css`

### Commit Messages
```
type: subject

body (optional)

footer (optional)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Questions?

- Open a [Discussion](https://github.com/edamame-labs/aipedia.org/discussions)
- Check existing issues and discussions first

---

Thank you for contributing to open AI education! 🙌

