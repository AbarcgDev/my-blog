// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { execSync } from 'child_process';
import tailwind from "@astrojs/tailwind"

import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [mdx(), sitemap(), tailwind(), icon()],
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    },
    imageService: "cloudflare"
  }),
  markdown: {
    remarkPlugins: [
      () => (tree, file) => {
        try {
          // VALIDACIÓN: file.history es un array, necesitamos el primer elemento
          const filepath = Array.isArray(file.history) ? file.history : file.history;

          if (filepath) {
            const result = execSync(`git log -1 --format=%ai "${filepath}"`);
            file.data.astro.frontmatter.lastModified = result.toString().trim();
          }
        } catch (e) {
          // Si no estamos en un repo git o falla, usamos la fecha actual
          file.data.astro.frontmatter.lastModified = new Date().toISOString();
        }
      },
    ],
  },
});