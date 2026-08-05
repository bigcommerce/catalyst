---
"@bigcommerce/catalyst": minor
---

Standardize resource commands on plural names: `catalyst project` is now `catalyst projects`, and `catalyst channel` is now `catalyst channels`, matching the already-plural `domains` and `logs`. The singular form of every resource command remains as an alias — `project`, `channel`, `domain`, and `log` all still resolve — so existing scripts keep working. Telemetry continues to report the canonical plural name regardless of which form was typed.
