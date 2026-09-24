---
"@bigcommerce/catalyst": patch
---

Set a channel's checkout URL to its `c.` checkout hostname on a managed hosting zone, instead of prompting for one.

`catalyst deploy --update-site-url --update-checkout-url` asked the merchant to type a checkout URL, defaulting to a `checkout.` subdomain that nothing would ever provision on a managed hosting zone. For a storefront on an auto-generated hostname (`<project>.catalyst-sandbox.store`) it now sets `https://c.<project>.catalyst-sandbox.store` without prompting.

Setting it is what provisions it: BigCommerce registers the hostname and issues its certificate in response to the write, usually within a couple of minutes. The CLI writes first, then waits for the certificate. If none issues within six minutes, when BigCommerce stops trying, it removes the checkout URL again so checkout falls back to the default channel's rather than staying broken.

It leaves an existing custom checkout URL alone, and on a re-run where the hostname is already set it only waits for the certificate. A storefront on a custom domain, or `--update-checkout-url` without `--update-site-url`, still prompts as before.
