---
'@bigcommerce/catalyst-core': minor
---

Add `hosting` and `channel_id` meta tags so Support can confirm a storefront is served by native hosting and which channel it belongs to. `hosting` renders the `CATALYST_HOSTING` env var, which `catalyst deploy` sets to `native`.
