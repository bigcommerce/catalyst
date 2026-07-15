---
"@bigcommerce/catalyst": minor
---

`catalyst` now reads the API host from `CATALYST_API_HOST` (renamed from `BIGCOMMERCE_API_HOST`) and resolves it with the same precedence as other credentials: `--api-host` flag > `CATALYST_API_HOST` > `.bigcommerce/project.json` `apiHost` > default `api.bigcommerce.com`. **Breaking:** the `BIGCOMMERCE_API_HOST` environment variable is no longer read — set `CATALYST_API_HOST` instead.
