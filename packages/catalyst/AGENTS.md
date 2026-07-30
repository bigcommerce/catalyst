# Catalyst CLI (`@bigcommerce/catalyst`)

CLI tool for Catalyst development and deployment — handles build, dev server, and deployment to Cloudflare Workers.

## Directory Structure

```
src/cli/
├── index.ts          # Entry point (#!/usr/bin/env node)
├── program.ts        # Commander program setup, registers all commands
├── commands/         # CLI command implementations (auth, build, deploy, logs, project, start, telemetry, version)
├── hooks/            # Pre/post action hooks (telemetry)
└── lib/              # Utilities (auth, logger, project config, credentials, wrangler config, telemetry, deployment errors)
templates/            # OpenNext config and public_headers template
tests/mocks/          # MSW handlers and test mocks
dist/cli.js           # Bundled output (single ESM file)
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `auth whoami/login/logout` | Manage authentication (device code OAuth flow, credential storage) |
| `build` | Build Catalyst project using OpenNext/Cloudflare adapter |
| `deploy` | Deploy to Cloudflare with bundle upload |
| `logs` | View logs (`tail` default, `query` planned). Supports `--format` (default/json/pretty/short/request) |
| `project create/list/link` | Manage BigCommerce infrastructure projects |
| `start` | Start local preview using OpenNext Cloudflare adapter |
| `telemetry` | Enable/disable/check telemetry |
| `version` | Display version and platform info |

## Development

```bash
pnpm dev          # Watch mode (rebuilds dist/cli.js on changes)
pnpm build        # Production build via tsup
pnpm test         # Run tests (vitest)
pnpm test:watch   # Watch mode tests
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint with 0 warnings threshold
```

## Testing Changes

To test CLI changes directly without a full publish cycle, build the CLI package first, then run the compiled output from inside the `core/` directory using its absolute path:

```bash
# From packages/catalyst — rebuild the CLI
pnpm build

# From core/ — run the CLI using the absolute path to the built output
pnpm exec <repo-root>/packages/catalyst/dist/cli.js <command>
```

For example: `pnpm exec <repo-root>/packages/catalyst/dist/cli.js project list`.

## Build

- **Bundler**: tsup (`tsup.config.ts`)
- **Entry**: `src/cli/index.ts` → `dist/cli.js` (single ESM bundle with source maps)
- **Environment variables** injected at build time: `CLI_SEGMENT_WRITE_KEY`, `CONSOLA_LEVEL`

## Testing

- **Framework**: Vitest (`vitest.config.ts`)
- **Coverage threshold**: 100% (strict)
- **Mocking**: MSW for BigCommerce API calls; telemetry always disabled in tests (`vitest.setup.ts`)
- **Test files**: co-located as `*.spec.ts` next to source files

## Key Dependencies

- `commander` — CLI framework
- `execa` — process execution (next, pnpm, wrangler)
- `consola` — logging
- `zod` — API response validation
- `conf` — persistent config (`.bigcommerce/project.json`)
- `@segment/analytics-node` — telemetry
- `adm-zip` — bundle zipping for deploy

## After Making Changes

Always run `pnpm typecheck` and `pnpm lint` after making code changes, and fix any errors or warnings before considering the work done. The lint config enforces zero warnings (`--max-warnings 0`). Use `pnpm lint --fix` to auto-fix formatting and fixable lint issues before manually editing.

## Code Style Notes

- **No `let` when avoidable** — prefer `const` with `while (true)` + `break` over mutable flags.
- **No iterators/generators** — eslint `no-restricted-syntax` disallows `for...of` and generator functions. Use `.forEach()`, `.map()`, etc.
- **Consola for logging** — use `consola` (from `../lib/logger`) instead of `console`. Use `colorize` from `consola/utils` for colored output.
- **Shared CLI options** — commands that need `--store-hash`, `--access-token`, `--api-host`, and `--project-uuid` should use the shared option factories from `lib/shared-options.ts`. Chain `.makeOptionMandatory()` inline where needed to preserve commander's extra-typings inference.
- **SSE stream pattern** — the fetch API's `ReadableStreamDefaultReader` doesn't support async iteration, so `while (true)` + `reader.read()` + `break` is the standard pattern. For long-lived streams, implement a TTL-based reconnect to free connection pool resources, and distinguish server-side disconnects (`TypeError: terminated`) from actual failures for retry logic.

## Integration Points

- **BigCommerce Infrastructure API**: `https://api.bigcommerce.com/stores/{storeHash}/v3/infrastructure/`
- **Next.js**: dev/build/start
- **OpenNext + Cloudflare**: serverless build and deploy via Wrangler
