---
"@bigcommerce/catalyst": patch
---

Stop telling merchants a checkout subdomain of an auto-generated deployment hostname can never be issued a certificate.

The cross-domain checkout diagnostic reported that a storefront on an auto-generated hostname could never have a checkout URL, and told the merchant to buy a custom domain to get one:

> `<project>.catalyst-sandbox.store` is an auto-generated deployment hostname, and a checkout subdomain of one cannot be issued a certificate — so no checkout URL can be set for this channel until its storefront is on a custom domain. Add one with `catalyst domains add`.

That reasoning was wrong. The auto-generated hostnames are Cloudflare for SaaS custom hostnames, not names covered by a single-level wildcard certificate, and custom hostnames have no label-depth limit — each gets its own certificate. The practical harm was sending merchants to acquire a domain they do not need.

The diagnostic now names the checkout hostname (`c.<project>.<zone>`) and prints the `catalyst channels update --checkout-url` command that sets it. Setting it is what provisions it: BigCommerce registers the hostname and issues its certificate in response, which takes a few minutes.

`suggestCheckoutUrl` also gains a managed-zone mode. It prefixed `checkout.` unconditionally, which on a managed zone named a hostname nobody will ever create, and spent nine characters of a 64-character certificate common-name budget that the project name has to share. On a managed zone it now suggests the shorter `c.` prefix.

Whether a storefront is on a managed zone is now decided by the fixed set of zones native hosting generates hostnames under, the same list ignition uses. It used to be derived from the project's `deployment_hostnames`, which also lists custom domains added with `catalyst domains add`, so a merchant's own domain could be described as an auto-generated hostname.
