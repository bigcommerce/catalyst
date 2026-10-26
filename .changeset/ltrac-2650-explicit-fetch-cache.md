---
"@bigcommerce/catalyst-core": patch
---

Give every `client.fetch` call an explicit cache option, so reads like the maintenance page message no longer sit in the Data Cache indefinitely and mutations always forward the shopper IP. A currency cookie set to the store default is now treated as no preference, so it no longer creates a second cache entry.
