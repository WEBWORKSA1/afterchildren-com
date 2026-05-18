import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel/serverless';

// NOTE: @astrojs/sitemap@3.2.0 is currently incompatible with our
// `output: 'hybrid'` configuration — the integration's astro:build:done
// hook throws `Cannot read properties of undefined (reading 'reduce')`
// when it tries to enumerate routes that span the prerendered +
// serverless split. The dependency remains in package.json so it can
// be re-wired later once a working version pair is identified. For
// now, the site is fully internally linked from the homepage and
// pillars, so Google's crawler will index everything via natural
// link-following. A hand-written /public/sitemap.xml can be added
// when SEO crawl efficiency becomes a measurable bottleneck.

export default defineConfig({
  site: 'https://afterchildren.com',
  output: 'hybrid',
  adapter: vercel({
    webAnalytics: { enabled: false },
    maxDuration: 8,
  }),
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      theme: 'github-light'
    }
  },
  build: {
    inlineStylesheets: 'auto'
  }
});
