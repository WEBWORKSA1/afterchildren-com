// This file has been intentionally emptied.
//
// The original /api/subscribe.ts was a server-side Beehiiv proxy for
// newsletter signups. It was returning HTTP 503 because Beehiiv env
// vars are not configured (newsletter intentionally deferred until
// ~1,000 readers per earlier project decision).
//
// On 2026-05-18 we switched from output: 'hybrid' + serverless adapter
// to output: 'static' to resolve a chain of Vercel deployment failures.
// Static builds cannot serve API routes. This file would have caused
// the static build to error.
//
// When the newsletter is reactivated:
//   1. Switch astro.config.mjs back to output: 'hybrid' and the
//      serverless adapter (see comments there)
//   2. Restore this file from git history
//      (git log --all --diff-filter=D -- site/src/pages/api/subscribe.ts
//       then git show <COMMIT>:site/src/pages/api/subscribe.ts)
//   3. Set BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID in Vercel
//      project env vars
//   4. Update vercel.json outputDirectory accordingly
//
// This file remains as a placeholder so the path is documented and
// the comment trail is preserved. Astro will not register it as a
// route because it does not export an HTTP method handler.

export {};
