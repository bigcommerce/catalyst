---
"@bigcommerce/catalyst": patch
---

Fix CLI environment variable resolution for `deploy`, `build`, and `project` commands. The published dist was using stale `BIGCOMMERCE_*` env var names instead of the correct `CATALYST_*` names (`CATALYST_STORE_HASH`, `CATALYST_ACCESS_TOKEN`, `CATALYST_PROJECT_UUID`).
