---
"@bigcommerce/catalyst": patch
---

Fix the cross-domain checkout warning for storefronts on an auto-generated hostname (`<project>.catalyst-sandbox.store`). It no longer says a checkout URL can't be set there. Instead it names the checkout hostname, `c.<project>.catalyst-sandbox.store`, and prints the `catalyst channels update --checkout-url` command that sets it. A custom domain is no longer mistaken for an auto-generated hostname.
