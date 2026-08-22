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

const articles = defineCollection({
  loader: glob({
    pattern: '{websites,identity,print,presentations,smm,support}/*.md',
    base: './content-drafts/seo',
  }),
  schema: z.object({
      title: z.string(),
      description: z.string(),
      h1: z.string(),
      service: z.string(),
      primaryKeyword: z.string(),
      searchIntent: z.string().optional(),
      relatedKeywords: z.array(z.string()).default([]),
      status: z.enum(['draft', 'published']).default('draft'),
      publishedAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      author: z.string().default('Yapil'),
      reviewer: z.string().optional(),
      cover: z.string().optional(),
    })
    .refine((data) => data.status !== 'published' || Boolean(data.publishedAt), {
      message: 'Для опубликованной статьи укажите publishedAt',
      path: ['publishedAt'],
    }),
});

export const collections = { cases, vsyachina, articles };
