---
"@bigcommerce/catalyst": patch
---

Warn when a channel's checkout domain doesn't share a main domain with its storefront. Because the checkout redirect is resolved server-side from channel config, pointing a channel's site URL at a new domain silently leaves checkout on the old one — and a cross-domain checkout is where shopper sessions and carts stop carrying over in browsers that restrict cross-domain cookies. `catalyst channels update` and `catalyst deploy --update-site-url` now check for this right after they move the site URL, and `catalyst channels checkout-url` reports it too.

The advice adapts to the storefront domain: on a custom domain it suggests the `checkout.<domain>` subdomain to point at BigCommerce, and on an auto-generated deployment hostname it explains that the shared checkout domain is the only option there and that a custom domain is the prerequisite for changing it. The check is advisory and never fails the command that ran it. Hostnames are compared conservatively — a bare public suffix can never be what makes two of them match, so a storefront on `example.co.uk` with checkout on `other.co.uk` is correctly reported as cross-domain.
