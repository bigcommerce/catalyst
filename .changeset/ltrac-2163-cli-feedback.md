---
'@bigcommerce/catalyst': minor
---

Add ways to send feedback to the BigCommerce team from the CLI:

- After a successful `catalyst deploy`, the CLI can ask one question: how was your experience using the Catalyst native hosting CLI (0–10), with an optional comment. It asks at most once every three months on each machine. Press Enter without a number to skip it. It never asks in CI or without a TTY. To turn it off, pass `--no-hints` or set `CATALYST_NO_HINTS`. Only the score, your comment, the CLI version, and the command name are sent.
- After an unexpected error, the CLI asks whether to send an error report to BigCommerce (default: No). The report has the error message and stack, the command, the Correlation ID, the CLI version, and the `catalyst debug` report, with the home directory shown as `~`. Errors that you can fix yourself (bad input, an expired token, a 4xx response) do not ask. In CI, without a TTY, or without credentials, the CLI shows a hint to run `catalyst feedback` instead. `--no-hints` and `CATALYST_NO_HINTS` turn off the question and the hint.
- `catalyst feedback` sends feedback, a bug report, or a feature request at any time. Pass `--title` and `--description`, or answer the prompts. The `catalyst debug` report is attached (with no secret values, and the home directory shown as `~`). Use `--no-diagnostics` to send without it.
