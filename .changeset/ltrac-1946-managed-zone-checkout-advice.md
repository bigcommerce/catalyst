---
"@bigcommerce/catalyst": patch
---

Stop telling merchants a checkout subdomain of an auto-generated deployment hostname can never be issued a certificate.

The cross-domain checkout diagnostic reported that a storefront on an auto-generated hostname could never have a checkout URL, and told the merchant to buy a custom domain to get one:

> `<project>.catalyst-sandbox.store` is an auto-generated deployment hostname, and a checkout subdomain of one cannot be issued a certificate — so no checkout URL can be set for this channel until its storefront is on a custom domain. Add one with `catalyst domains add`.

That reasoning was wrong. The auto-generated hostnames are Cloudflare for SaaS custom hostnames, not names covered by a single-level wildcard certificate, and custom hostnames have no label-depth limit — each gets its own certificate. The practical harm was sending merchants to acquire a domain they do not need.

The diagnostic now names the checkout hostname that will exist and says it is not provisioned yet, rather than claiming it is impossible, and no longer recommends `catalyst domains add` as the remedy.

`suggestCheckoutUrl` also gains a managed-zone mode. It prefixed `checkout.` unconditionally, which on a managed zone named a hostname nobody will ever create, and spent nine characters of a 64-character certificate common-name budget that the project name has to share. On a managed zone it now suggests the shorter prefix that native hosting provisions.

Behaviour is otherwise unchanged: a checkout URL still isn't offered or suggested for a storefront on a managed zone, because the hostname isn't provisioned yet. The guard matters more than the old comments implied — BigCommerce would *accept* such a URL, since it shares a main domain with the storefront, and leave checkout resolving without a certificate.
