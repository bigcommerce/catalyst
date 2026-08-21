---
"@bigcommerce/catalyst": patch
---

Ship the `_headers` file so hashed static assets get an immutable `Cache-Control`, instead of being revalidated on every repeat page view.

`packages/catalyst/templates/public_headers` has always specified the right policy for `/_next/static/*`, but nothing ever copied it into the build output — `build.ts` wrote only `open-next.config.ts` and `wrangler.jsonc`, and no `_headers` file existed anywhere in the repo.

Without it, Workers Assets serves those files with its own default. Measured on a deployed store, all 32 hashed assets on a product page returned:

```
cache-control: public, max-age=0, must-revalidate
```

`max-age=0, must-revalidate` on a **content-hashed** filename is wrong by construction: the hash *is* the version, so a given URL can never return different bytes. The header forced browsers to issue a conditional request for all 32 assets on every repeat view (~75ms each, all answered `304 Not Modified`), including 4 render-blocking CSS files and 3 fonts. With the intended `public,max-age=31536000,immutable`, those requests disappear entirely.

The reason the header was missing at all is that `/_next/static/*` never reaches the Next.js server on Workers — Cloudflare's asset layer serves it directly, so Next's own immutable header never applies. `_headers` is the supported override, and OpenNext's `migrate` command generates a byte-identical `public/_headers` for exactly this reason, treating it as the app's responsibility.

## What changed

- `build.ts` now copies `templates/public_headers` to `.open-next/assets/_headers`. It is written *after* the OpenNext build, because that build regenerates the assets directory, and *before* the Wrangler dry-run so Wrangler validates it. The existing recursive copy into `.bigcommerce/dist/assets` carries it into the uploaded bundle.
- Added a regression test asserting the copy happens. The original bug was not a wrong value but an absent one, with nothing asserting it — verified the new test fails when the copy is removed.
