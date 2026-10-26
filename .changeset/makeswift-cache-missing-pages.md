---
"@bigcommerce/catalyst-makeswift": patch
---

Cache Makeswift "page not found" lookups (and missing-locale component lookups) for up to five minutes, cleared on publish, so requests for unknown paths no longer cost an uncached Makeswift API call each. Draft mode is unaffected.
