---
"@bigcommerce/catalyst": patch
---

Stop framing clear, user-actionable CLI errors as bugs to report. Validation errors, not-found and not-enabled responses, conflicts, and bad command input now print just the message and exit, instead of appending a Correlation ID and a "share this with BigCommerce support" prompt. That framing is now reserved for genuine server-side (5xx) failures and unexpected errors. Applies across the `domains`, `project`, `channel`, `logs`, and `auth` commands via a shared `UserActionableError` type.
