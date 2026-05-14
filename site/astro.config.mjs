import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://afterchildren.com',
  output: 'hybrid',
  adapter: vercel({
    webAnalytics: { enabled: false },
    maxDuration: 8,
  }),
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-light'
    }
  },
  build: {
    inlineStylesheets: 'auto'
  }
});
