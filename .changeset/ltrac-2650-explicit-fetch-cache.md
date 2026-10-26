---
"@bigcommerce/catalyst-core": patch
---

Give every `client.fetch` call an explicit cache option, so reads like the maintenance page message no longer sit in the Data Cache indefinitely and mutations always forward the shopper IP. Switching back to the store default currency now clears the currency cookie, so it no longer creates a second cache entry.
