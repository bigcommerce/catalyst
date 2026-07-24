# @bigcommerce/catalyst

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
