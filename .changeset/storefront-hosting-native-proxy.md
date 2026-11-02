---
'@bigcommerce/catalyst': minor
---

Storefront Hosting setup no longer renames `proxy.ts` to `middleware.ts`. `@opennextjs/cloudflare` 1.20.15 bundles `proxy.ts` directly, so setup now pins it (up from 1.20.6) and `catalyst build` defaults to Wrangler 4.156.0.

Migration: projects set up by an older CLI keep their generated `middleware.ts` and continue to work. If `catalyst upgrade` brings `proxy.ts` back beside it, the CLI offers to delete `middleware.ts`; move any changes you made in it into `proxy.ts` first. `catalyst upgrade` now also stages the files it removes, `middleware.ts` and `instrumentation.ts`.
