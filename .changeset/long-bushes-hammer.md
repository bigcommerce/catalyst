---
"@bigcommerce/catalyst-core": patch
---

Update the image loader conditional to allow subdomain matches for the cdn url.

For example, setting `NEXT_PUBLIC_BIGCOMMERCE_CDN_HOSTNAME` to `store.test` will allow subomain to match, like `cdn.store.test`.
