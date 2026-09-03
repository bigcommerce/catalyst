# @bigcommerce/catalyst

## 1.4.0

### Minor Changes

- [#3203](https://github.com/bigcommerce/catalyst/pull/3203) [`b68192a`](https://github.com/bigcommerce/catalyst/commit/b68192aac81e2f96e7e6dbc28800773bb1ba2f80) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Upgrade `@opennextjs/cloudflare` from 1.17.3 to 1.20.6, and the Wrangler version the build runs from 4.90.0 to 4.128.0.

  A stray `@opennextjs/cloudflare` entry is also removed from the repo root, where it should never have been. The adapter stays a peer dependency of the CLI package, which is the correct declaration: the copy that matters has to live in the merchant's own project, both so the build can invoke the adapter's binary from there and because the generated `open-next.config.ts` imports it. Wrangler is not declared anywhere, since the build invokes a pinned version directly. Neither belongs in this repo's dependency graph.

  `catalyst build` and `catalyst deploy` now offer to update a project's own `@opennextjs/cloudflare` pin when it has fallen behind the version the CLI targets, and reinstall so the worker is compiled against it. The check runs on the shared build path, immediately before the adapter is invoked. That pin lives in the project's `package.json`, so it previously stayed at whatever version the project was scaffolded with and adapter fixes were skipped with no indication at all.

  The upgrade is offered only when it is safe to take. A project whose Next.js version the newer adapter does not support is told to run `catalyst upgrade` first, rather than being handed an unsupported dependency set. Nothing is changed under `catalyst deploy --prebuilt`, which skips the build and would upload a bundle the new adapter never compiled, nor in a non-interactive environment such as CI, where rewriting dependencies would break an install against a frozen lockfile — both report the exact command to run instead. A project already on, or ahead of, the target version is left alone silently.

  The adapter's version range on the CLI is relaxed to `^1.17.3` and marked optional, and a stray `@opennextjs/cloudflare` entry is removed from the repo root. It was previously an exact pin, which meant projects still on the older adapter version could not install the upgraded CLI at all — the projects the upgrade prompt above is meant to reach — and projects hosted somewhere that never installs the adapter reported it as missing.

  Node 20 is dropped from the supported `engines` range, which is now `^22.0.0 || ^24.0.0`. Every Wrangler release the adapter now accepts requires Node 22 or later. In practice `catalyst build` and `catalyst deploy` already could not work on Node 20, because the previously pinned `wrangler@4.90.0` also requires it; what does regress is `catalyst start`.

  For stores already deployed on Commerce Hosting, the sharded tag cache Durable Object adds two columns to its table the first time it is accessed after the next deploy, backing the stale-while-revalidate `revalidateTag` support added upstream. The migration is automatic and no configuration change is needed.

  Fixes picked up in the range include a security fix for encoded paths bypassing middleware matching or selecting partially-decoded cache entries, a fix for `/_next/static/*` returning 404 on past deployments when a metadata-only Worker version became the newest one, and R2 cache population over remote dev, which is not subject to the Cloudflare API rate limit of 1,200 requests per 5 minutes that failed builds for large catalogs.

### Patch Changes

- [#3159](https://github.com/bigcommerce/catalyst/pull/3159) [`49a3432`](https://github.com/bigcommerce/catalyst/commit/49a34324925d65dad4e6b3e17d4d0b1d4132c978) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Fix `catalyst build`/`catalyst deploy` failing on native Windows during the OpenNext step. The generated `open-next.config.ts` hardcoded `node_modules/.bin/next build` as its `buildCommand`, which OpenNext runs through `execSync` (cmd.exe on Windows) — where the extensionless POSIX shim and forward-slash path fail to resolve. It now invokes `node ./node_modules/next/dist/bin/next build`, which works identically across sh and cmd.exe while still skipping the project's `generate` step.

- [#3169](https://github.com/bigcommerce/catalyst/pull/3169) [`ed8fc56`](https://github.com/bigcommerce/catalyst/commit/ed8fc56f2f438775e3ce3a9fda1b01f14f586f97) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Bind a `CATALYST_ROUTES_KV` Cloudflare KV namespace in the generated Wrangler config, so the routing cache used by `proxies/with-routes` has a shared store on BigCommerce Native Hosting instead of degrading to a per-invocation in-memory cache. The generated config points at a local-only placeholder namespace id used by `wrangler dev`/`catalyst start` and the `wrangler deploy --dry-run` bundling step; the real per-project namespace is bound at deploy time.

- [#3204](https://github.com/bigcommerce/catalyst/pull/3204) [`bb35f22`](https://github.com/bigcommerce/catalyst/commit/bb35f22d180f1d21e35caf12e50fd4aa0deec1e0) Thanks [@mfaris9](https://github.com/mfaris9)! - `catalyst build` and `catalyst deploy` now run GraphQL codegen (`generate`) automatically, so a fresh project no longer needs a manual `pnpm build` before its first deploy.

## 1.3.0

### Minor Changes

- [#3156](https://github.com/bigcommerce/catalyst/pull/3156) [`9990a87`](https://github.com/bigcommerce/catalyst/commit/9990a872931d95b38fc8c66cd216ccb0be041bf3) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Print the DNS records to publish when `catalyst domains add` succeeds. The A and CNAME values that point the domain at the project are shown with the success message, along with which to publish and a note that they are only returned when the domain is added. The records survive `--wait`, and are omitted when the API has none to share yet.

- [#3166](https://github.com/bigcommerce/catalyst/pull/3166) [`382bdf5`](https://github.com/bigcommerce/catalyst/commit/382bdf594bcc07425f6f82729659bfe9eaf9696c) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Standardize resource commands on plural names: `catalyst project` is now `catalyst projects`, and `catalyst channel` is now `catalyst channels`, matching the already-plural `domains` and `logs`. The singular form of every resource command remains as an alias — `project`, `channel`, `domain`, and `log` all still resolve — so existing scripts keep working. Telemetry continues to report the canonical plural name regardless of which form was typed.

- [#3192](https://github.com/bigcommerce/catalyst/pull/3192) [`d263871`](https://github.com/bigcommerce/catalyst/commit/d263871a7aab465be3bffad05c77c5649ac9afaf) Thanks [@chanceaclark](https://github.com/chanceaclark)! - `catalyst upgrade` now keeps your `@bigcommerce/catalyst*` dependencies up to date.

  Until now these versions never moved during an upgrade, so a project stayed pinned to whatever it was created with. The upgrade now brings them to the versions that shipped with the release you're upgrading to, handled like any other change: applied automatically, or flagged as a conflict if you'd pinned one on purpose.

  If your project still references these packages with `workspace:^`, the upgrade offers to swap them for published versions so your package manager can keep them current from then on. Declining, running without a terminal, or using `--dry-run` changes nothing; `--yes` accepts.

  Two new reminders round it out: run an install when the upgrade touched your `package.json`, and update `@bigcommerce/catalyst` itself when a newer version is out.

### Patch Changes

- [#3164](https://github.com/bigcommerce/catalyst/pull/3164) [`eef0c18`](https://github.com/bigcommerce/catalyst/commit/eef0c186544315c68f201ce9bdeccd563f4619aa) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Stop asking users to log in again after `catalyst create`. Credentials from the initial authentication are now written to the new project's `.bigcommerce/project.json` on every scaffold, not just `--hosting commerce`, so `catalyst deploy` no longer fails with "Missing credentials" and `catalyst project create` no longer re-prompts for login.

- [#3167](https://github.com/bigcommerce/catalyst/pull/3167) [`2ec54df`](https://github.com/bigcommerce/catalyst/commit/2ec54df10b80ee3768fdfa2c611d707ff1e69fc6) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Print every request under `catalyst logs tail --format request`, including requests that emitted no log messages. Previously each line was tied to a log entry, so a request that logged nothing disappeared from the stream. The `request` format now reads `[timestamp] METHOD URL (status) [LEVEL] message`, moving the level after the request details in both `logs tail` and `logs query`. `catalyst logs tail --help` now documents each format and notes that `default` and `short` only show requests with a message body.

- [#3193](https://github.com/bigcommerce/catalyst/pull/3193) [`391f96c`](https://github.com/bigcommerce/catalyst/commit/391f96c159ea482c1e09a519148ec1463d56ea39) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Replace the Durable Object revalidation queue with a self-fetch queue, so ISR revalidation can work on native hosting at all.

  **This does not make anything faster, and changes no behavior today.** Catalyst currently ships no route with a revalidate window, so the queue is never invoked. From the built prerender manifest, every prerendered route is `initialRevalidateSeconds: false` and `dynamicRoutes` is empty. The `next: { revalidate }` options on the product and faceted-search queries are fetch-level data caching and do not feed this queue.

  What this fixes is a trap rather than a slowdown: with the previous config, the first route to adopt ISR would have failed to revalidate _silently_, because the error thrown below is an `IgnorableError` (`logLevel = 0`, dropped by OpenNext's logger under the default threshold). Pages would have gone permanently stale with nothing in the logs.

  OpenNext's `doQueue` routes revalidation through a Durable Object whose constructor reads `env.WORKER_SELF_REFERENCE` and throws without it:

  ```js
  this.service = env.WORKER_SELF_REFERENCE;
  if (!this.service) throw new IgnorableError('No service binding for cache revalidation worker');
  ```

  **That binding cannot exist on native hosting.** A Cloudflare `service` binding resolves against account-level Workers, and a Catalyst deployment is a script inside a dispatch namespace, which is not addressable that way. Adding it was attempted and rejected at upload:

  ```
  400 Bad Request  code 10143
  Service binding 'WORKER_SELF_REFERENCE' references Worker
  '…' which was not found.
  ```

  The `dispatch_namespace` binding sometimes suggested as the alternative is worse: OpenNext calls `.fetch()` directly on the value while that binding exposes `.get(name)`, and `.get()` accepts _any_ script in the namespace — binding it into a tenant Worker would let any deployment invoke any other deployment's Worker.

  ## What changed

  Revalidation does not require a binding. It is a `HEAD` request to the page's own public URL carrying the build-time preview secret — exactly what the Durable Object issues once it holds the service handle. `queue` now uses a small self-contained queue that issues that request with a plain `fetch`, which leaves and re-enters through the dispatch router and arrives at the same Worker. `global_fetch_strictly_public` is already set, so the subrequest is not short-circuited internally.

  It remains wrapped in `queueCache`, so concurrent stale hits for one path still collapse into a single revalidation.

  **Trade-off:** the Durable Object's retry and max-concurrency handling is lost. A failed revalidation is retried on the next stale hit rather than by the queue itself, and revalidations are no longer capped at a concurrency limit.

  The `NEXT_CACHE_DO_QUEUE` binding is intentionally left in place. OpenNext's worker template exports all three Durable Object classes unconditionally, so it still resolves and needs no Durable Object migration; it is simply inert.

- [#3183](https://github.com/bigcommerce/catalyst/pull/3183) [`ce7d1b2`](https://github.com/bigcommerce/catalyst/commit/ce7d1b23ca2b352e9aad2d3f4b112513574156c2) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Restore tag checking on regional cache hits, replacing a CDN cache purge that never worked.

  `cachePurge` was declared in the generated `open-next.config.ts` but never had credentials on native hosting, so every purge attempt no-opped with `No cache zone ID or API token provided. Skipping cache purge.` The declaration alone was harmful: OpenNext's `isPurgeCacheEnabled()` only checks whether `cachePurge` is _declared_, not whether it works. Believing purge was handling invalidation, it disabled `shouldLazilyUpdateOnCacheHit` — documented as on by default for `'long-lived'` mode — and Catalyst additionally set `bypassTagCacheOnCacheHit: true`.

  A regional (Cache API) hit was therefore neither purged, nor refreshed from R2, nor checked against the tag cache. Stale data was served for the full `max-age` window (the route's `revalidate`, or a 30-minute default), and `revalidateTag` calls landing in that window had no effect on it.

  ## Purge and tag-checking are alternatives, and we had neither

  `doShardedTagCache.writeTags()` always writes the revalidation time to its Durable Object shards and always clears the regional _tag_ cache. Only the CDN purge is gated behind `isPurgeCacheEnabled()`. So tag invalidation was already durable — purge exists solely to evict _incremental cache_ entries held in the Cache API, which is exactly the check `bypassTagCacheOnCacheHit` was skipping.

  Either mechanism delivers correct invalidation: purge evicts the entries, or the tag cache is consulted on hits. Catalyst was configured for the first and got neither.

  ## What changed
  - Removed `bypassTagCacheOnCacheHit: true`, so the tag cache is consulted on a regional hit. The OpenNext docs require this option be paired with working purge: "make sure that the cache gets purged either by enabling the auto cache purging feature or manually."
  - Removed `cachePurge: purgeCache({ type: 'durableObject' })`, restoring `shouldLazilyUpdateOnCacheHit` to its documented default so a hit also refreshes from R2 in the background.

  The trade is an extra tag-cache read and R2 read on a cache hit, which is what those options were exchanging for correctness. Invalidation via `revalidateTag` now actually takes effect on regional cache hits.

  ## Why purge was not simply fixed

  Purge requires a Cloudflare API token bound into the Worker, and a Worker binding is readable by the merchant's own application code. Cloudflare purge is zone-scoped and native hosting places all tenants on one shared zone, so a token extracted from any tenant could purge every other tenant's cache. Scoping it to Cache Purge alone reduces the severity but does not remove it.

  Instant invalidation via purge remains worth having — it is faster than tag-checking and avoids the extra reads. Restoring it needs a design that keeps the credential out of tenant Workers, such as routing purge through a platform-owned worker or an authenticated service endpoint with per-tenant authorization.

  The `NEXT_CACHE_DO_PURGE` Durable Object binding is intentionally left in place. OpenNext's worker template exports all three DO classes unconditionally, so the binding still resolves and no Durable Object migration is required; it is simply inert until purge returns.

- [#3184](https://github.com/bigcommerce/catalyst/pull/3184) [`5f7e630`](https://github.com/bigcommerce/catalyst/commit/5f7e6306761ab459224638bfd6fd7ede568b0079) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Ship the `_headers` file so hashed static assets get an immutable `Cache-Control`, instead of being revalidated on every repeat page view.

  `packages/catalyst/templates/public_headers` has always specified the right policy for `/_next/static/*`, but nothing ever copied it into the build output — `build.ts` wrote only `open-next.config.ts` and `wrangler.jsonc`, and no `_headers` file existed anywhere in the repo.

  Without it, Workers Assets serves those files with its own default. Measured on a deployed store, all 32 hashed assets on a product page returned:

  ```
  cache-control: public, max-age=0, must-revalidate
  ```

  `max-age=0, must-revalidate` on a **content-hashed** filename is wrong by construction: the hash _is_ the version, so a given URL can never return different bytes. The header forced browsers to issue a conditional request for all 32 assets on every repeat view (~75ms each, all answered `304 Not Modified`), including 4 render-blocking CSS files and 3 fonts. With the intended `public,max-age=31536000,immutable`, those requests disappear entirely.

  The reason the header was missing at all is that `/_next/static/*` never reaches the Next.js server on Workers — Cloudflare's asset layer serves it directly, so Next's own immutable header never applies. `_headers` is the supported override, and OpenNext's `migrate` command generates a byte-identical `public/_headers` for exactly this reason, treating it as the app's responsibility.

  ## What changed
  - `build.ts` now copies `templates/public_headers` to `.open-next/assets/_headers`. It is written _after_ the OpenNext build, because that build regenerates the assets directory, and _before_ the Wrangler dry-run so Wrangler validates it. The existing recursive copy into `.bigcommerce/dist/assets` carries it into the uploaded bundle.
  - Added a regression test asserting the copy happens. The original bug was not a wrong value but an absent one, with nothing asserting it — verified the new test fails when the copy is removed.

- [#3178](https://github.com/bigcommerce/catalyst/pull/3178) [`a78f93c`](https://github.com/bigcommerce/catalyst/commit/a78f93cf72999de13fadd98cb144f1e1c5bc5bb1) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Stop `catalyst deploy` from wiping stored deployment environment variables. Commerce Hosting setup rebuilt `.bigcommerce/project.json` from scratch, dropping anything it didn't write itself — the `env` block managed by `catalyst env`, the persisted `apiHost`, and stored credentials when setup ran without them. Because `deploy` re-runs setup whenever the project isn't fully transformed, a routine deploy could silently discard variables that are sent as secrets on every deploy, leaving the next one to ship without them. Setup now merges into the existing file.

## 1.2.0

### Minor Changes

- [#3124](https://github.com/bigcommerce/catalyst/pull/3124) [`bb04eca`](https://github.com/bigcommerce/catalyst/commit/bb04ecab9e0e905efd04da10536083479f9e8ed3) Thanks [@parthshahp](https://github.com/parthshahp)! - Add pagination to `catalyst logs query`. Use `--limit <count>` (1–500) to cap the page size, `--after <cursor>` to page toward older entries, and `--before <cursor>` to page toward newer ones. When more entries are available, the CLI prints a ready-to-run command for the next page with the time window pinned to absolute timestamps.

## 1.1.1

### Patch Changes

- [#3119](https://github.com/bigcommerce/catalyst/pull/3119) [`bd72110`](https://github.com/bigcommerce/catalyst/commit/bd721106dbded48e823acad6548019d1210258f6) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Add `store_v2_products`, `store_v2_content`, and `store_sites` OAuth scopes so `catalyst create` no longer errors when creating a new channel with sample data.

## 1.1.0

### Minor Changes

- [#3111](https://github.com/bigcommerce/catalyst/pull/3111) [`9565d76`](https://github.com/bigcommerce/catalyst/commit/9565d7636de95327651af0a90ced37a352241be7) Thanks [@jorgemoya](https://github.com/jorgemoya)! - `catalyst` now reads the API host from `CATALYST_API_HOST` (renamed from `BIGCOMMERCE_API_HOST`) and resolves it with the same precedence as other credentials: `--api-host` flag > `CATALYST_API_HOST` > `.bigcommerce/project.json` `apiHost` > default `api.bigcommerce.com`. **Breaking:** the `BIGCOMMERCE_API_HOST` environment variable is no longer read — set `CATALYST_API_HOST` instead.

- [#3110](https://github.com/bigcommerce/catalyst/pull/3110) [`5ca4c61`](https://github.com/bigcommerce/catalyst/commit/5ca4c615ead79bc3bf1b7b1bc3ce1743fddeb12b) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add the `catalyst debug` command, which prints a diagnostic report (CLI version, runtime, the project's package manager, project/config state, telemetry correlation ID, and which key files exist) to include when filing a bug report. Credentials and environment variables are resolved across the same chain a build uses (`process.env` > `.env.local` > `.env` > `.bigcommerce/project.json`) and reported by name and source only — secret values are never printed. Use `--json` for machine-readable output.

- [#3084](https://github.com/bigcommerce/catalyst/pull/3084) [`aadaf27`](https://github.com/bigcommerce/catalyst/commit/aadaf27b72cbbf0889262a26ca44daec54bdbbb4) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add the `catalyst domains claim` command, which claims ownership of a custom domain that is already in use on another store. When you try to add a domain bound to a different store, `catalyst domains add` now prints the ownership-verification TXT record to publish; after publishing it, run `catalyst domains claim <domain>` to release the domain from the other store and bind it to your project.

- [#3089](https://github.com/bigcommerce/catalyst/pull/3089) [`8d9f9a9`](https://github.com/bigcommerce/catalyst/commit/8d9f9a92da07d65ec8c9cc9a45ec1ffb582d96c7) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add the `catalyst domains transfer` command, which moves a custom domain from one project to another project in the same store (the same-store counterpart to `domains claim`). Pass `--to-project-uuid <uuid>` to target a specific project, or omit it to pick the destination interactively from your store's projects. When `catalyst domains add` fails because the domain is already bound to another project in the store, it now points you at the exact `domains transfer` command to move it instead of surfacing the raw API error.

- [#3098](https://github.com/bigcommerce/catalyst/pull/3098) [`05f600a`](https://github.com/bigcommerce/catalyst/commit/05f600a5fcee8c17927b2b56343f942a2e6d4b2c) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Env-file loading is now scoped to `catalyst build` and `catalyst deploy` — the only commands that need storefront environment variables (for the build). Previously `.env.local` was auto-loaded globally from the current working directory (but `.env` was not), which was surprising, inconsistent, and affected commands that don't use those variables. Now `build` and `deploy` auto-load `.env.local` and `.env` from the current directory (with `.env.local` taking precedence, and neither overriding your real environment), and you can point at a specific file with `--env-path <path>`. No other command reads env files.

  Migration: if you relied on env vars being auto-loaded for a command other than `build`/`deploy`, set them in your shell environment or pass the relevant flags instead. For a build with an env file outside the project directory, use `catalyst deploy --env-path ../.env.local`.

### Patch Changes

- [#3105](https://github.com/bigcommerce/catalyst/pull/3105) [`552cfb5`](https://github.com/bigcommerce/catalyst/commit/552cfb5c59a1e69b92f7018c2ddc3c9b3c5f0c61) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add a `--wrangler-version <version>` flag to `catalyst build` and `catalyst deploy` so developers can build against a Wrangler version or dist-tag other than the pinned default. When omitted, the build uses the pinned default as before (and the flag is ignored by `deploy --prebuilt`, which skips the build). The value is validated to look like a version or dist-tag before it's interpolated into the `wrangler@<version>` spec.

- [#3102](https://github.com/bigcommerce/catalyst/pull/3102) [`fea7b30`](https://github.com/bigcommerce/catalyst/commit/fea7b30bab0d1b09dc5bddbe3884317968264760) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add the `@bigcommerce/catalyst` CLI to a newly created project's `devDependencies` instead of `dependencies`. The CLI is a build-time tool (it only backs the `build`/`start`/`deploy` npm scripts) and is never imported at runtime, so it doesn't belong in runtime dependencies.

- [#3095](https://github.com/bigcommerce/catalyst/pull/3095) [`27373e8`](https://github.com/bigcommerce/catalyst/commit/27373e8a50c9bd0703f474364a7c269947d56179) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Validate channel names before creating a channel. `catalyst create` and `catalyst channel create` now reject names containing unsupported characters (such as an apostrophe in "Bob's Store") with a clear message that names the offending input and lists the allowed characters — letters, numbers, spaces, hyphens, and underscores — instead of surfacing an opaque API error. The interactive prompt validates as you type, and an invalid `--name` flag fails fast.

- [#3099](https://github.com/bigcommerce/catalyst/pull/3099) [`b4e5952`](https://github.com/bigcommerce/catalyst/commit/b4e595210b2a38e24aac98c656581dfbd67a1c8f) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Unify the device-code login UX across `auth login`, `create`, and the channel commands. The CLI now waits for you to press Enter before opening the browser and best-effort copies the one-time code to your clipboard so you can paste it directly (the code is still printed as a fallback). Non-interactive/CI runs skip the prompt and open directly.

- [#3097](https://github.com/bigcommerce/catalyst/pull/3097) [`e3e5ab2`](https://github.com/bigcommerce/catalyst/commit/e3e5ab2e3cae414e6067017b1a8939f472fa1456) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Fail `catalyst build`/`catalyst deploy` fast with a clear, actionable error when required environment variables (`BIGCOMMERCE_STORE_HASH`, `BIGCOMMERCE_STOREFRONT_TOKEN`, `BIGCOMMERCE_CHANNEL_ID`, `AUTH_SECRET`) aren't loaded, instead of surfacing a raw OpenNext/Next.js build stack trace. The check also runs on the plain `next build` fallthrough (non-Commerce-Hosting projects), not just the Commerce Hosting pipeline. The message names the missing variables and explains that the build auto-loads `.env.local` and `.env` from the current directory (or pass `--env-path <path>` to load a file from elsewhere).

- [#3107](https://github.com/bigcommerce/catalyst/pull/3107) [`0d42b12`](https://github.com/bigcommerce/catalyst/commit/0d42b12a59157eceba1397411de504767d7a309d) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Fix the dependency install step hanging indefinitely during `catalyst project link` and the `catalyst deploy` first-run setup. nypm runs the install through tinyexec, which in silent mode drains the child's stdout to completion before it reads stderr; pnpm floods stderr with Node warnings (on Node 26, thousands of `File descriptor N opened in unmanaged mode` lines), filling the stderr pipe buffer while tinyexec is still on stdout, so pnpm blocks writing and the install deadlocks. The install now runs the child with `NODE_NO_WARNINGS` (and pins `COREPACK_ENABLE_DOWNLOAD_PROMPT` off) so stderr never fills. The `link`/`deploy` setup paths also now detect the project's actual package manager from its lockfile instead of always forcing pnpm.

- [#3096](https://github.com/bigcommerce/catalyst/pull/3096) [`c1d0f3d`](https://github.com/bigcommerce/catalyst/commit/c1d0f3df789f304f8ce1aa07225cdcc5a110dfa3) Thanks [@jorgemoya](https://github.com/jorgemoya)! - `project create` now shows the actionable "Infrastructure Projects API not enabled — contact support to join the beta" guidance when the API responds `404`, matching the existing `403` handling, instead of a cryptic `Failed to create project: Not Found`.

- [#3094](https://github.com/bigcommerce/catalyst/pull/3094) [`bf58b13`](https://github.com/bigcommerce/catalyst/commit/bf58b134cd870e04ec585eec465e93ce9481d13b) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Give the CLI readable, actionable errors when a BigCommerce API returns a 4xx or 5xx. A shared HTTP-error helper now turns a failed response into a clear message: it prefers the API's own reason (`detail`/`title`/field errors) and, when the body is empty or unparseable, falls back to curated copy for the status class. Client (4xx) errors are treated as user-actionable and print without the "share this Correlation ID with BigCommerce support" framing, while server (5xx) errors keep it. This replaces the raw `... failed: <status> <statusText>` throws across the `channel`, `project`, `deploy`, `logs`, and `auth` API paths.

- [#3088](https://github.com/bigcommerce/catalyst/pull/3088) [`ce03afb`](https://github.com/bigcommerce/catalyst/commit/ce03afb8e7ef27e4821e99f8fd4e4d94a7654922) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Stop framing clear, user-actionable CLI errors as bugs to report. Validation errors, not-found and not-enabled responses, conflicts, and bad command input now print just the message and exit, instead of appending a Correlation ID and a "share this with BigCommerce support" prompt. That framing is now reserved for genuine server-side (5xx) failures and unexpected errors. Applies across the `domains`, `project`, `channel`, `logs`, and `auth` commands via a shared `UserActionableError` type.

- [#3100](https://github.com/bigcommerce/catalyst/pull/3100) [`07cd41c`](https://github.com/bigcommerce/catalyst/commit/07cd41cd5867fd3fc520a7a3fda752f059bf0c5a) Thanks [@jorgemoya](https://github.com/jorgemoya)! - The CLI now follows `.env.example` as the source of truth when writing `.env.local`. Generated env files preserve the documented ordering and per-key comment blocks, render documented-but-unsupplied keys as blank/default active keys, and append any CLI-only variables in a clearly separated trailing section. Existing `.env.local` values are reconciled rather than clobbered on re-runs (e.g. `channel link`), so user-set values are preserved while newly documented keys are added in their canonical position.

## 1.0.0

### Major Changes

- [#3077](https://github.com/bigcommerce/catalyst/pull/3077) [`a45ab43`](https://github.com/bigcommerce/catalyst/commit/a45ab4346c27e8cc60d6ce64fb597f22dbde2243) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Introducing the Catalyst CLI (`@bigcommerce/catalyst`) — a single command-line tool for scaffolding, building, and deploying your Catalyst storefront to BigCommerce's Native Hosting infrastructure.

  ### Highlights
  - **Scaffold a storefront** — `catalyst create` downloads a clean, standalone project (flattened from `core/`, `workspace:` dependencies resolved to published versions, fresh git repo) via tarball extraction and connects it to your BigCommerce store. The package manager is auto-detected from `npm_config_user_agent`.
  - **Browser-based authentication** — Run `catalyst auth login` to authenticate via an OAuth device code flow. Credentials are stored locally in `.bigcommerce/project.json` for use by all subsequent commands. CI/CD environments can use `--store-hash` and `--access-token` flags or environment variables instead.
  - **Project & channel management** — Create, link, and list BigCommerce infrastructure projects with `catalyst project`, and connect storefront channels with `catalyst channel`.
  - **Build & deploy** — `catalyst build` runs the OpenNext Cloudflare build pipeline (deriving the Wrangler `compatibility_date` dynamically) and generates deployment artifacts. `catalyst deploy` bundles, uploads, and deploys your storefront with real-time progress streaming. Pass runtime secrets with `--secret KEY=VALUE`; environment variables are auto-detected as deploy secrets.
  - **Persisted deployment env vars** — Manage deployment environment variables across deploys with `catalyst env` (list and remove; values are masked).
  - **Custom domains** — Add, list, check the status of, and remove custom domains for a Native Hosting project with `catalyst domains`.
  - **Local preview** — `catalyst start` launches a local Cloudflare Workers preview of your built storefront via the OpenNext adapter.
  - **Live & historical logs** — `catalyst logs tail` streams real-time application logs with color-coded levels and auto-reconnect; `catalyst logs query` retrieves historical logs.
  - **In-place upgrades** — `catalyst upgrade` upgrades a project to a newer version via a resilient 3-way merge (`git merge-tree`, falling back to per-file `git merge-file`), producing resolvable conflict markers instead of ever aborting.
  - **Smart credential resolution** — Configuration is resolved in priority order: CLI flags → `--env-file` → process environment variables → `.bigcommerce/project.json`.
  - **Telemetry** — Anonymous usage telemetry with session and correlation IDs for support. Opt out anytime with `catalyst telemetry disable`.

  ### Commands

  | Command              | Description                                                          |
  | -------------------- | -------------------------------------------------------------------- |
  | `catalyst create`    | Scaffold and connect a Catalyst storefront to your BigCommerce store |
  | `catalyst auth`      | Authenticate, sign out, and verify stored credentials                |
  | `catalyst project`   | Create, link, and list infrastructure projects                       |
  | `catalyst channel`   | Connect a storefront channel to your project                         |
  | `catalyst build`     | Build your Catalyst project for deployment                           |
  | `catalyst deploy`    | Build and deploy to BigCommerce Native Hosting                       |
  | `catalyst env`       | Manage persisted deployment environment variables                    |
  | `catalyst domains`   | Manage custom domains for a Native Hosting project                   |
  | `catalyst start`     | Start a local Cloudflare Workers preview                             |
  | `catalyst logs`      | Stream live logs and query historical logs                           |
  | `catalyst upgrade`   | Upgrade a project to a newer version via 3-way merge                 |
  | `catalyst version`   | Display CLI, Node.js, and platform info                              |
  | `catalyst telemetry` | View or change telemetry collection status                           |

  ### Getting started

  ```bash
  cd core
  pnpm add @bigcommerce/catalyst@latest @opennextjs/cloudflare@1.17.3
  pnpm catalyst auth login
  pnpm catalyst project create
  pnpm catalyst deploy --secret BIGCOMMERCE_STORE_HASH=<hash> --secret BIGCOMMERCE_STOREFRONT_TOKEN=<token>
  ```

  For full documentation, see the [Native Hosting Overview](https://developer.bigcommerce.com/docs/storefront/catalyst/deployment/native-hosting/overview) and [CLI Reference](https://developer.bigcommerce.com/docs/storefront/catalyst/reference/cli).

## 1.0.0-alpha.6

### Patch Changes

- [#3061](https://github.com/bigcommerce/catalyst/pull/3061) [`eea1355`](https://github.com/bigcommerce/catalyst/commit/eea135543423dc0d50d6bff68d93f1548e54e096) Thanks [@jorgemoya](https://github.com/jorgemoya)! - `catalyst build` now derives the Cloudflare Workers `compatibility_date` dynamically (current date minus one month) instead of using a pinned date, keeping the build-time runtime semantics aligned with what the deployment service applies at deploy time.

## 1.0.0-alpha.5

### Minor Changes

- [#2988](https://github.com/bigcommerce/catalyst/pull/2988) [`24f35a4`](https://github.com/bigcommerce/catalyst/commit/24f35a4cc60d73036c264a896e816b98aa47bfba) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Show every deployed URL for each project in `catalyst project list` output (the canonical hostname plus any vanity hostnames) so users can recover the hosted storefront URLs without having to redeploy.

### Patch Changes

- [#3028](https://github.com/bigcommerce/catalyst/pull/3028) [`bdc6e0b`](https://github.com/bigcommerce/catalyst/commit/bdc6e0bf055262e1440bcc1ebcc55597256b424a) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove `core/instrumentation.ts` and the `@vercel/otel` dependency during Commerce Hosting setup. The hook isn't compatible with the OpenNext + Cloudflare Workers bundling path and caused a "Failed to prepare server" error on every cold start in `catalyst logs tail`. Self-hosted (non-Commerce Hosting) deployments are unaffected.

## 1.0.0-alpha.4

### Patch Changes

- [`de04f42`](https://github.com/bigcommerce/catalyst/commit/de04f42696b30b675bec2625eefa1e825b4a97ba) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Add built-in help text to all CLI commands so `catalyst <command> --help` is the canonical reference.

- [`e740158`](https://github.com/bigcommerce/catalyst/commit/e7401583603aae85d4adef23b4b72eeb96e11907) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Show the global `--env-path` option in every subcommand's `--help` output.

- [`e5b4dee`](https://github.com/bigcommerce/catalyst/commit/e5b4dee1fc108d648b6110707b572c1fc9bc2e7c) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Update the CLI with the new client id.

## 1.0.0-alpha.3

### Minor Changes

- [#2972](https://github.com/bigcommerce/catalyst/pull/2972) [`e681933`](https://github.com/bigcommerce/catalyst/commit/e681933ebbe798198e4c1b8f6f20f67dc4ec36ad) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Auto-detect environment variables as deploy secrets.

## 1.0.0-alpha.2

### Patch Changes

- Fix CLI environment variable resolution for `deploy`, `build`, and `project` commands. The published dist was using stale `BIGCOMMERCE_*` env var names instead of the correct `CATALYST_*` names (`CATALYST_STORE_HASH`, `CATALYST_ACCESS_TOKEN`, `CATALYST_PROJECT_UUID`).

## 1.0.0-alpha.1

### Major Changes

- Introducing the Catalyst CLI (`@bigcommerce/catalyst`) — a command-line tool for building and deploying your Catalyst storefront to BigCommerce's Native Hosting infrastructure.

  ### Highlights
  - **Browser-based authentication** — Run `catalyst auth login` to authenticate via an OAuth device code flow. Credentials are stored locally in `.bigcommerce/project.json` for use by all subsequent commands. CI/CD environments can use `--store-hash` and `--access-token` flags or environment variables instead.
  - **Project management** — Create, link, and list BigCommerce infrastructure projects with `catalyst project create`, `catalyst project link`, and `catalyst project list`.
  - **Build & deploy** — `catalyst build` runs the OpenNext Cloudflare build pipeline and generates deployment artifacts. `catalyst deploy` bundles, uploads, and deploys your storefront with real-time progress streaming. Pass runtime secrets with `--secret KEY=VALUE`.
  - **Local preview** — `catalyst start` launches a local Cloudflare Workers preview of your built storefront via the OpenNext adapter.
  - **Live log tailing** — `catalyst logs tail` streams real-time application logs from your deployed storefront with color-coded log levels and multiple output formats.
  - **Smart credential resolution** — Configuration is resolved in priority order: CLI flags → `--env-file` → process environment variables → `.bigcommerce/project.json`.
  - **Telemetry** — Anonymous usage telemetry with session and correlation IDs for support. Opt out anytime with `catalyst telemetry disable`.

  ### Commands

  | Command                   | Description                                       |
  | ------------------------- | ------------------------------------------------- |
  | `catalyst auth login`     | Authenticate via browser OAuth flow               |
  | `catalyst auth logout`    | Remove stored credentials                         |
  | `catalyst auth whoami`    | Verify credentials and display store/project info |
  | `catalyst project create` | Create a new infrastructure project               |
  | `catalyst project link`   | Link to an existing infrastructure project        |
  | `catalyst project list`   | List infrastructure projects for your store       |
  | `catalyst build`          | Build your Catalyst project for deployment        |
  | `catalyst deploy`         | Build and deploy to BigCommerce Native Hosting    |
  | `catalyst start`          | Start a local Cloudflare Workers preview          |
  | `catalyst logs tail`      | Stream live logs from your deployment             |
  | `catalyst version`        | Display CLI, Node.js, and platform info           |
  | `catalyst telemetry`      | View or change telemetry collection status        |

  ### Getting started

  ```bash
  cd core
  pnpm add @bigcommerce/catalyst@alpha @opennextjs/cloudflare@1.17.3
  pnpm catalyst auth login
  pnpm catalyst project create
  pnpm catalyst deploy --secret BIGCOMMERCE_STORE_HASH=<hash> --secret BIGCOMMERCE_STOREFRONT_TOKEN=<token>
  ```

  For full documentation, see the [Native Hosting Overview](https://developer.bigcommerce.com/docs/storefront/catalyst/deployment/native-hosting/overview) and [CLI Reference](https://developer.bigcommerce.com/docs/storefront/catalyst/reference/cli).

## 1.0.0-alpha.0

### Major Changes

- [`acee114`](https://github.com/bigcommerce/catalyst/commit/acee114ca0ee7428e33b1db28a5b3b18914cde4b) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Alpha version of the CLI
