---
"@bigcommerce/catalyst-client": patch
---

Add optional `locale` parameter to `client.fetch()`. This allows locale to be passed explicitly for use in cached contexts where `getLocale()` is unavailable.
