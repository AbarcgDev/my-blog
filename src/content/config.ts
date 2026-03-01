import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(70, "El título es muy largo para SEO"), // Validación de longitud
    description: z.string().min(50, "La descripción debe ser más detallada"),
    pubDate: z.coerce.date(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default(['General']),
    // Draft: Para que puedas escribir borradores sin que se publiquen en el dominio real
    draft: z.boolean().default(false),
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
