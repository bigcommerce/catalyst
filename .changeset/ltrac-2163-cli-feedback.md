---
'@bigcommerce/catalyst': minor
---

Add ways to send feedback to the BigCommerce team from the CLI:

- `catalyst feedback` sends feedback, a bug report, or a feature request at any time. Pass `--title` and `--description`, or answer the prompts. The `catalyst debug` report is attached (with no secret values, and the home directory shown as `~`). Use `--no-diagnostics` to send without it.
