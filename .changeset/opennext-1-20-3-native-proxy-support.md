---
"@bigcommerce/catalyst": minor
---

Commerce Hosting setup no longer renames `proxy.ts` to `middleware.ts`.

Next.js 16 renamed the middleware convention to `proxy.ts`, which always runs on the Node.js runtime. Earlier versions of `@opennextjs/cloudflare` only understood `middleware.ts`, so `catalyst deploy` rewrote the file: it renamed `proxy.ts`, changed `export const proxy` to `export const middleware`, and injected `runtime: 'experimental-edge'` into the exported config. That left deployed projects diverging from the scaffold and from the Next.js docs.

[`@opennextjs/cloudflare` 1.20.3](https://github.com/opennextjs/opennextjs-cloudflare/releases/tag/%40opennextjs%2Fcloudflare%401.20.3) bundles Node.js middleware natively, so the rewrite is gone — your `proxy.ts` is now deployed as-is. The `nodejs_compat` compatibility flag this requires was already being written into the generated Wrangler config.

Alongside this, setup now installs `@opennextjs/cloudflare` 1.20.3 (up from 1.17.3) and `catalyst build` defaults to Wrangler 4.126.0, which 1.20.3 requires.

A project is now considered set up for deployment based only on `@opennextjs/cloudflare` being installed, rather than on which middleware filename is present. Projects transformed by an older CLI keep their renamed `middleware.ts`; Next.js still honors that filename, so they continue to build and deploy without any migration.
