import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const agenda = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/agenda' }),
  schema: z.object({
    title: z.string(),
    title_en: z.string().optional(),
    type: z.enum(['atelier', 'chaos-lab', 'concert', 'jam', 'other']).default('atelier'),
    date: z.date(),
    time_start: z.string().optional(),
    time_end: z.string().optional(),
    duration: z.string().optional(),
    location: z.string().optional(),
    subtitle: z.string().optional(),
    subtitle_en: z.string().optional(),
    description: z.string(),
    description_en: z.string().optional(),
    participants: z.array(z.string()).default([]),
    tools: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
    cover_image: z.string().optional(),
    photos: z.array(z.string()).default([]),
    video_url: z.string().optional(),
  }),
});

const artists = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/artists' }),
  schema: z.object({
    name: z.string(),
    collective: z.boolean().default(false),
    image: z.string().optional(),
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
    url: z.string().optional(),
    description: z.string(),
    description_en: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    period: z.string().optional(),
    participants: z.array(z.string()).default([]),
    links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
    description: z.string(),
    description_en: z.string().optional(),
  }),
});

export const collections = {
  agenda,
  artists,
  tools,
  media,
  projects,
};
