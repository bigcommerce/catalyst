---
"@bigcommerce/catalyst": patch
---

Stop writing `CATALYST_ACCESS_TOKEN` into `.env.local` during `catalyst create`. The CLI never read it back — env files are not consulted when resolving credentials — so its only effect was to imply that they are, leading users to add `CATALYST_STORE_HASH` alongside it and then hit "Missing credentials" from `catalyst project list` and `catalyst deploy`. `.env.local` now carries `BIGCOMMERCE_*` build variables only, and CLI configuration lives in `.bigcommerce/project.json`, which scaffolding already writes. Existing projects are unaffected: the stale entry is harmless and is left in place.
