import { defineCollection, z } from 'astro:content';
import { CATEGORIES, RESOURCE_KINDS } from '../lib/labels';

const resource = z.object({
  kind: z.enum(RESOURCE_KINDS),
  title: z.string(),
  url: z.string().url(),
  // Authors, venue, or a short "why read this"
  note: z.string().optional(),
});

const wiki = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(CATEGORIES),
    // Who made it, as shown on cards: "Vaswani et al.", "Andrej Karpathy", "Stanford"
    by: z.string().optional(),
    // Year the original work came out (not the date this page was written)
    year: z.number().int().optional(),
    tags: z.array(z.string()).default([]),
    // Date the page was added to the site
    date: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    // The first resource is the primary one (usually the original paper)
    resources: z.array(resource).default([]),
  }),
});

export const collections = { wiki };
