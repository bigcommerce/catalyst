---
"@bigcommerce/catalyst": minor
---

Add pagination to `catalyst logs query`. Use `--limit <count>` (1–500) to cap the page size, `--after <cursor>` to page toward older entries, and `--before <cursor>` to page toward newer ones. When more entries are available, the CLI prints a ready-to-run command for the next page with the time window pinned to absolute timestamps.
