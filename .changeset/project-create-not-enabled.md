---
"@bigcommerce/catalyst": patch
---

`project create` now shows the actionable "Infrastructure Projects API not enabled — contact support to join the beta" guidance when the API responds `404`, matching the existing `403` handling, instead of a cryptic `Failed to create project: Not Found`.
