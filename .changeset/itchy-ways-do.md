---
"@bigcommerce/catalyst-client": minor
---

Add an `errorPolicy` option for GQL requests. Accepts `none`, `ignore`, `all`. Defaults to `none` which throws an error if there are GQL errors, `ignore` returns the data without error object, and `all` returns both data and errors.
