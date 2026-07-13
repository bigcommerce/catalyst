---
"@bigcommerce/catalyst": patch
---

Validate channel names before creating a channel. `catalyst create` and `catalyst channel create` now reject names containing unsupported characters (such as an apostrophe in "Bob's Store") with a clear message that names the offending input and lists the allowed characters — letters, numbers, spaces, hyphens, and underscores — instead of surfacing an opaque API error. The interactive prompt validates as you type, and an invalid `--name` flag fails fast.
