# @bigcommerce/catalyst

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
