// ARAYI Market — Astro config (static output for Cloudflare Pages)
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://market.arayimport.am',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    locales: ['hy', 'en', 'ru'],
    defaultLocale: 'hy',
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
