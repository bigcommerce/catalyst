---
"@bigcommerce/catalyst": minor
---

Env-file loading is now scoped to `catalyst build` and `catalyst deploy` — the only commands that need storefront environment variables (for the build). Previously `.env.local` was auto-loaded globally from the current working directory (but `.env` was not), which was surprising, inconsistent, and affected commands that don't use those variables. Now `build` and `deploy` auto-load `.env.local` and `.env` from the current directory (with `.env.local` taking precedence, and neither overriding your real environment), and you can point at a specific file with `--env-path <path>`. No other command reads env files.

Migration: if you relied on env vars being auto-loaded for a command other than `build`/`deploy`, set them in your shell environment or pass the relevant flags instead. For a build with an env file outside the project directory, use `catalyst deploy --env-path ../.env.local`.
