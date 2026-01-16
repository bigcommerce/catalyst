---
"@bigcommerce/catalyst-client": patch
---

Fix `client.fetch` so that custom headers passed via `fetchOptions.headers` properly override the client's default headers. Headers are now built via a `Headers` object using `.set()`, so case-insensitive overrides work as expected.
