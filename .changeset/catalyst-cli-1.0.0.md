---
"@bigcommerce/catalyst": major
---

Introducing the Catalyst CLI (`@bigcommerce/catalyst`) — a single command-line tool for scaffolding, building, and deploying your Catalyst storefront to BigCommerce's Native Hosting infrastructure.

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

| Command | Description |
|---------|-------------|
| `catalyst create` | Scaffold and connect a Catalyst storefront to your BigCommerce store |
| `catalyst auth` | Authenticate, sign out, and verify stored credentials |
| `catalyst project` | Create, link, and list infrastructure projects |
| `catalyst channel` | Connect a storefront channel to your project |
| `catalyst build` | Build your Catalyst project for deployment |
| `catalyst deploy` | Build and deploy to BigCommerce Native Hosting |
| `catalyst env` | Manage persisted deployment environment variables |
| `catalyst domains` | Manage custom domains for a Native Hosting project |
| `catalyst start` | Start a local Cloudflare Workers preview |
| `catalyst logs` | Stream live logs and query historical logs |
| `catalyst upgrade` | Upgrade a project to a newer version via 3-way merge |
| `catalyst version` | Display CLI, Node.js, and platform info |
| `catalyst telemetry` | View or change telemetry collection status |

### Getting started

```bash
cd core
pnpm add @bigcommerce/catalyst@latest @opennextjs/cloudflare@1.17.3
pnpm catalyst auth login
pnpm catalyst project create
pnpm catalyst deploy --secret BIGCOMMERCE_STORE_HASH=<hash> --secret BIGCOMMERCE_STOREFRONT_TOKEN=<token>
```

For full documentation, see the [Native Hosting Overview](https://developer.bigcommerce.com/docs/storefront/catalyst/deployment/native-hosting/overview) and [CLI Reference](https://developer.bigcommerce.com/docs/storefront/catalyst/reference/cli).
