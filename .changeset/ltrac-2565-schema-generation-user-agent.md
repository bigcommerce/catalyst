---
"@bigcommerce/catalyst-core": patch
---

Send a Catalyst `User-Agent` when fetching the GraphQL schema during `dev` and `build`. Previously the schema request used Node's default `User-Agent`, so firewall rules that only allow Catalyst traffic blocked it with `Failed to load schema. CombinedError: [Network] Forbidden`.
