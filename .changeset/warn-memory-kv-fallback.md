---
"@bigcommerce/catalyst-core": patch
---

Log a warning in production when the proxy's route cache falls back to per-instance memory because no shared KV store is configured, and document which hosts need one.
