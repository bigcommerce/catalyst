---
'@bigcommerce/catalyst': patch
---

`catalyst channels update` now keeps a channel's custom checkout URL when the new storefront URL shares its main domain, instead of letting it fall back to the default channel's domain.
