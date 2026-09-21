import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    year: z.string(),
    categories: z.array(z.enum(['branding', 'motion', 'web'])),
    tag: z.string(),
    tagDark: z.string(),
    excerpt: z.string(),
    cover: z.string().url(),
    coverAlt: z.string(),
    featured: z.boolean().default(false),
    views: z.string().optional(),
  }),
});

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    minutes: z.string(),
    excerpt: z.string(),
    cover: z.string().url(),
    coverAlt: z.string(),
    date: z.string(),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    role: z.string(),
    avatar: z.string().url(),
  }),
});

const awards = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/awards' }),
  schema: z.object({
    year: z.string(),
    title: z.string(),
    org: z.string(),
    count: z.string(),
  }),
});

export const collections = { work, journal, testimonials, awards };
