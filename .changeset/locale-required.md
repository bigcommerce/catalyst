---
"@bigcommerce/catalyst-client": minor
"@bigcommerce/catalyst-core": minor
---

Make `locale` a required parameter on `client.fetch()`. All call sites now explicitly pass locale for correct channel resolution and `Accept-Language` header, including inside `unstable_cache` contexts where `getLocale()` is unavailable.
