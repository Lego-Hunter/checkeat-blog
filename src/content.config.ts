import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const story = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/story' }),
  schema: z.object({
    title: z.string(),
    episode: z.number(),
    description: z.string(),
    series: z.string(),
  }),
});

const tech = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tech' }),
  schema: z.object({
    title: z.string(),
    phase: z.number(),
    phaseName: z.string(),
    series: z.string(),
    order: z.number(),
    storyRef: z.string(),
  }),
});

export const collections = { story, tech };
