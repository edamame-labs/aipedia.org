// Captures a preview of each entry's visualization, in both themes, into
// public/thumbs/<slug>.webp and public/thumbs/<slug>.dark.webp.
//
// Start the dev server first (npm run dev), then:
//   npm run thumbs              # every entry
//   npm run thumbs -- gan dqn   # just these
//
// Uses your installed Google Chrome. Set BASE_URL to capture from another server
// (a production preview is faster: npm run build && npm run preview).
import { mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import sharp from 'sharp';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4321';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT_DIR = `${ROOT}public/thumbs`;
const OUTPUT_WIDTH = 1080;
const ASPECT = 10 / 16;
const THEMES = [
  { name: 'light', suffix: '' },
  { name: 'dark', suffix: '.dark' },
];

const slugs = process.argv.length > 2
  ? process.argv.slice(2)
  : readdirSync(`${ROOT}src/content/wiki`)
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => file.replace(/\.mdx$/, ''));

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const contexts = await Promise.all(
  THEMES.map(async ({ name }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 2,
      colorScheme: name,
    });
    await context.addInitScript((theme) => localStorage.setItem('theme', theme), name);
    return context;
  })
);

/** Returns a reason when there is nothing to capture */
async function capture(page, slug, file) {
  await page.goto(`${BASE_URL}/${slug}`, { waitUntil: 'load' });
  // Keep the sticky header and dev toolbar out of the shot, and drop the
  // visualization's frame (a stylesheet survives the component re-rendering)
  await page.addStyleTag({
    content: `
      body > header { position: static !important }
      astro-dev-toolbar { display: none !important }
      .prose astro-island > * { border: 0 !important; border-radius: 0 !important }
    `,
  });

  const island = page.locator('.prose astro-island').first();
  if ((await island.count()) === 0) return 'no visualization';
  await page.evaluate(() => document.fonts.ready);

  // Crop the island (which React never replaces) to the card's 16:10 frame
  await island.evaluate((el, aspect) => {
    el.style.display = 'block';
    const { width } = el.getBoundingClientRect();
    Object.assign(el.style, {
      height: `${Math.round(width * aspect)}px`,
      overflow: 'hidden',
      background: 'rgb(var(--color-bg-secondary))',
    });
  }, ASPECT);
  // Visualizations hydrate with client:visible, so bring it on screen first
  await island.scrollIntoViewIfNeeded();
  await page.waitForSelector('.prose astro-island:not([ssr])');
  await page.waitForTimeout(1500); // let entrance animations settle

  const png = await island.screenshot({ animations: 'disabled' });
  await sharp(png).resize({ width: OUTPUT_WIDTH }).webp({ quality: 80 }).toFile(file);
}

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(`timed out after ${ms / 1000}s`)), ms).unref());
}

let failures = 0;
for (const slug of slugs) {
  let skipped;
  const errors = [];
  for (const [i, { name, suffix }] of THEMES.entries()) {
    // Visualizations occasionally re-render mid-capture; one retry covers it
    for (let attempt = 1; attempt <= 2; attempt++) {
      const page = await contexts[i].newPage();
      try {
        skipped = await Promise.race([capture(page, slug, `${OUT_DIR}/${slug}${suffix}.webp`), timeout(60_000)]);
        break;
      } catch (error) {
        if (attempt === 2) errors.push(`${name}: ${error.message.split('\n')[0]}`);
      } finally {
        await Promise.race([page.close(), timeout(10_000)]).catch(() => {});
      }
    }
    if (skipped) break;
  }
  if (errors.length) {
    failures++;
    console.error(`✗ ${slug} (${errors.join('; ')})`);
  } else {
    console.log(skipped ? `- ${slug}: ${skipped}` : `✓ ${slug}`);
  }
}

await browser.close();
if (failures) process.exitCode = 1;
