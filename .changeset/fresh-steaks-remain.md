---
"@bigcommerce/catalyst-client": patch
---

Fix `client.fetch` so that custom headers passed via `fetchOptions.headers` properly override the client's default headers (including `Authorization`). Previously the merge produced two distinct keys (e.g. `Authorization` and `authorization`) in a plain object, which `fetch` then `append`ed into a comma-joined value. Headers are now built via a `Headers` object using `.set()`, so case-insensitive overrides work as expected.
