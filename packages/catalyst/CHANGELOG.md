# @bigcommerce/catalyst

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
