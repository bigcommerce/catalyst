---
"@bigcommerce/catalyst": minor
---

Upgrade `@opennextjs/cloudflare` from 1.17.3 to 1.20.6, and the Wrangler version the build runs from 4.90.0 to 4.128.0.

A stray `@opennextjs/cloudflare` entry is also removed from the repo root, where it should never have been. The adapter stays a peer dependency of the CLI package, which is the correct declaration: the copy that matters has to live in the merchant's own project, both so the build can invoke the adapter's binary from there and because the generated `open-next.config.ts` imports it. Wrangler is not declared anywhere, since the build invokes a pinned version directly. Neither belongs in this repo's dependency graph.

`catalyst build` and `catalyst deploy` now offer to update a project's own `@opennextjs/cloudflare` pin when it has fallen behind the version the CLI targets, and reinstall so the worker is compiled against it. The check runs on the shared build path, immediately before the adapter is invoked. That pin lives in the project's `package.json`, so it previously stayed at whatever version the project was scaffolded with and adapter fixes were skipped with no indication at all.

The upgrade is offered only when it is safe to take. A project whose Next.js version the newer adapter does not support is told to run `catalyst upgrade` first, rather than being handed an unsupported dependency set. Nothing is changed under `catalyst deploy --prebuilt`, which skips the build and would upload a bundle the new adapter never compiled, nor in a non-interactive environment such as CI, where rewriting dependencies would break an install against a frozen lockfile — both report the exact command to run instead. A project already on, or ahead of, the target version is left alone silently.

The adapter's version range on the CLI is relaxed to `^1.17.3` and marked optional, and a stray `@opennextjs/cloudflare` entry is removed from the repo root. It was previously an exact pin, which meant projects still on the older adapter version could not install the upgraded CLI at all — the projects the upgrade prompt above is meant to reach — and projects hosted somewhere that never installs the adapter reported it as missing.

Node 20 is dropped from the supported `engines` range, which is now `^22.0.0 || ^24.0.0`. Every Wrangler release the adapter now accepts requires Node 22 or later. In practice `catalyst build` and `catalyst deploy` already could not work on Node 20, because the previously pinned `wrangler@4.90.0` also requires it; what does regress is `catalyst start`.

For stores already deployed on Commerce Hosting, the sharded tag cache Durable Object adds two columns to its table the first time it is accessed after the next deploy, backing the stale-while-revalidate `revalidateTag` support added upstream. The migration is automatic and no configuration change is needed.

Fixes picked up in the range include a security fix for encoded paths bypassing middleware matching or selecting partially-decoded cache entries, a fix for `/_next/static/*` returning 404 on past deployments when a metadata-only Worker version became the newest one, and R2 cache population over remote dev, which is not subject to the Cloudflare API rate limit of 1,200 requests per 5 minutes that failed builds for large catalogs.
