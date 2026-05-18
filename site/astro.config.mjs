import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel/static';

// Static-only build. The site is content + a deferred newsletter signup
// (currently displayed as a 'coming soon' placeholder). There are no
// active serverless requirements. The Vercel static adapter writes
// to dist/ which deploys cleanly on Vercel without any of the
// Build Output API discovery gymnastics that the serverless adapter
// required.
//
// If a serverless requirement re-emerges (working newsletter signup,
// gated content, dynamic API routes), the migration back is small:
//   - swap import to '@astrojs/vercel/serverless'
//   - swap output to 'hybrid'
//   - update vercel.json outputDirectory accordingly
//
// SITEMAP NOTE: @astrojs/sitemap was previously incompatible with our
// hybrid output. With output: 'static', it should work — but it's
// staying unwired in this commit to keep the deploy-fix surgical.
// Re-wiring sitemap is a separate (low-risk) change for a future
// commit once we've confirmed the static build is green.

export default defineConfig({
  site: 'https://afterchildren.com',
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: false },
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
