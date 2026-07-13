---
"@bigcommerce/catalyst": minor
---

Add the `catalyst domains transfer` command, which moves a custom domain from one project to another project in the same store (the same-store counterpart to `domains claim`). Pass `--to-project-uuid <uuid>` to target a specific project, or omit it to pick the destination interactively from your store's projects. When `catalyst domains add` fails because the domain is already bound to another project in the store, it now points you at the exact `domains transfer` command to move it instead of surfacing the raw API error.
