import { defineCollection, z } from "astro:content";
// import { glob } from "astro/loaders";


const events = defineCollection({
    // loader: glob({pattern: "**/*.md", base: ".src/content/events"}),
    type: "content",
    schema: z.object({
        title: z.string(),
        date: z.string().transform((str) => new Date(str)),
        heure: z.string(),
        lieu: z.string(),
        audience: z.string().optional(),
        prix: z.string().optional(),
        lien: z.string().optional(),        
    }),
});

const community = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        icon: z.string().optional(),
        link: z.string().optional(),
        link_label: z.string().optional(),
    }),
});

export const collections = {events, community};