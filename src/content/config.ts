import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(), // La de publicación sí la dejamos manual para tener control
    heroImage: z.string().optional(),
    // updatedDate: z.coerce.date().optional(), <-- COMENTA O BORRA ESTO
  }),
});


const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    repository: z.string().url().optional(),
    stack: z.array(z.string()), // Ejemplo: ['Cloudflare', 'TypeScript', 'Astro']
    featured: z.boolean().default(false),
    launchDate: z.coerce.date(),
  }),
});

export const collections = { blog, projects };
