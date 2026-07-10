---
"@bigcommerce/catalyst": minor
---

Env files are no longer auto-loaded by the CLI. Previously `.env.local` was automatically read from the current working directory (but `.env` was not), which was surprising and inconsistent. Now nothing is loaded automatically; pass `--env-path <path>` to load an env file explicitly.

Migration: if you relied on the automatic `.env.local` loading, pass the file explicitly, e.g. `catalyst deploy --env-path .env.local` (or `--env-path ./core/.env.local` when running from the repo root).
