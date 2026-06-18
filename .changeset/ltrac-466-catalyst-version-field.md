---
"@bigcommerce/catalyst-core": patch
---

Add a `catalyst` field to `core/package.json` (`catalyst.version` and `catalyst.ref`) that tracks the true Catalyst version independently of the top-level `version`, which merchants may repurpose for their own deploy tagging. The backend user-agent now reports `catalyst.version` (falling back to `version` for projects created before the field existed), and the release pipeline keeps the field in sync on each version bump.
