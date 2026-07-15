---
"@bigcommerce/catalyst": minor
---

Add the `catalyst debug` command, which prints a diagnostic report (CLI version, runtime, detected package manager, project/config state, telemetry correlation ID, and which key files exist) to include when filing a bug report. Secrets and PII are never printed — credentials, stored env vars, and environment variables are reported by presence only, never by value. Use `--json` for machine-readable output.
