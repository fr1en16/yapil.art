import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  schema: z.object({
    title: z.string(),
    year: z.string(),
    summary: z.string(),
    services: z.array(z.string()).min(1),
    cover: z.string(),
    order: z.number(),
    featured: z.boolean().default(false),
    task: z.string().optional(),
    goal: z.string().optional(),
    link: z.string().optional(),
    reviewed: z.boolean().default(false),
  }),
});

const vsyachina = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/vsyachina' }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    cover: z.url(),
    order: z.number().default(0),
    reviewed: z.boolean().default(false),
  }),
});

export const collections = { cases, vsyachina };
