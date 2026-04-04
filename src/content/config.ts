import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string().or(z.date().transform(d => d.toISOString().split('T')[0])).optional(),
    cover: z.string().optional(),
    excerpt: z.string().optional(),
  }),
});

const products = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    price: z.number(),
    cover: z.string().optional(),
  }),
});

export const collections = { posts, products };
