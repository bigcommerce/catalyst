---
"@bigcommerce/catalyst": minor
---

Add the `catalyst domains claim` command, which claims ownership of a custom domain that is already in use on another store. When you try to add a domain bound to a different store, `catalyst domains add` now prints the ownership-verification TXT record to publish; after publishing it, run `catalyst domains claim <domain>` to release the domain from the other store and bind it to your project.
