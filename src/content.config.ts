import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const agenda = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/agenda' }),
  schema: z.object({
    title: z.string(),
    title_en: z.string().optional(),
    date: z.date(),
    time_start: z.string().optional(),
    time_end: z.string().optional(),
    location: z.string(),
    subtitle: z.string().optional(),
    subtitle_en: z.string().optional(),
    description: z.string(),
    description_en: z.string().optional(),
    artists: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
  }),
});

const chaosLabs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/chaos-labs' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    participants: z.array(z.string()).default([]),
    duration: z.string().optional(),
    tools: z.array(z.string()).default([]),
    video_url: z.string().optional(),
    cover_image: z.string().optional(),
    photos: z.array(z.string()).default([]),
    event_links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
    description: z.string(),
    description_en: z.string().optional(),
  }),
});

const artists = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/artists' }),
  schema: z.object({
    name: z.string(),
    collective: z.boolean().default(false),
    tools: z.array(z.string()).default([]),
    links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
    bio: z.string().optional(),
    bio_en: z.string().optional(),
  }),
});

const tools = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tools' }),
  schema: z.object({
    name: z.string(),
    category: z.enum(['audio', 'visual', 'other']),
    community: z.boolean().default(false),
    url: z.string().url(),
    language: z.string().optional(),
    description: z.string(),
    description_en: z.string().optional(),
  }),
});

const media = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/media' }),
  schema: z.object({
    title: z.string(),
    title_en: z.string().optional(),
    date: z.date(),
    type: z.enum(['video', 'audio', 'image', 'link']),
    url: z.string().url().optional(),
    description: z.string(),
    description_en: z.string().optional(),
  }),
});

export const collections = {
  agenda,
  'chaos-labs': chaosLabs,
  artists,
  tools,
  media,
};
