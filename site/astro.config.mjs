import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// Pure static build with NO Vercel adapter.
//
// Why no adapter: Both @astrojs/vercel/static and @astrojs/vercel/serverless
// write to .vercel/output/ using Vercel's Build Output API spec. Our
// vercel.json was configured for outputDirectory: "site/dist" — which
// the adapters do not produce. The build kept failing because the
// adapter wrote to .vercel/output/static/ while Vercel was told to
// look in site/dist.
//
// Removing the adapter entirely gives us Astro's default static build,
// which writes to dist/ as the framework's native output directory.
// Vercel finds site/dist/ via vercel.json#outputDirectory and deploys
// it as a plain static site. This is the simplest possible deploy
// configuration for a content site like ours.
//
// If a serverless requirement re-emerges later, the migration back is:
//   - reinstall @astrojs/vercel
//   - add `import vercel from '@astrojs/vercel/serverless'` and
//     adapter: vercel({...}) to this config
//   - change output to 'hybrid'
//   - change vercel.json outputDirectory to match (or remove it
//     and let Build Output API discovery handle it)
//
// SITEMAP NOTE: @astrojs/sitemap should work with output: 'static' but
// is staying unwired in this commit to keep the deploy fix surgical.
// Re-wiring is a separate low-risk change once the deploy is green.

export default defineConfig({
  site: 'https://afterchildren.com',
  output: 'static',
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
