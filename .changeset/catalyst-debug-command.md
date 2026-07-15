---
"@bigcommerce/catalyst": minor
---

Add the `catalyst debug` command, which prints a diagnostic report (CLI version, runtime, the project's package manager, project/config state, telemetry correlation ID, and which key files exist) to include when filing a bug report. Credentials and environment variables are resolved across the same chain a build uses (`process.env` > `.env.local` > `.env` > `.bigcommerce/project.json`) and reported by name and source only — secret values are never printed. Use `--json` for machine-readable output.
