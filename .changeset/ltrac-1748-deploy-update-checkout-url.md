---
"@bigcommerce/catalyst": minor
---

Add `catalyst deploy --update-checkout-url`, alongside the existing `--update-site-url`, so a merchant setting up a custom domain can configure both of a channel's URLs in one pass. It prompts for the checkout URL after a successful deploy, defaulting to the `checkout.` subdomain of the channel's storefront domain — the near-certain answer given that BigCommerce requires the two to share a main domain. Unlike the site URL this can't be derived from the deployment, since the checkout domain has to already point at BigCommerce with a certificate provisioned there.

Passing both flags now resolves the channel once rather than asking twice, and either flow failing leaves the deploy reported as successful, since the bundle is already live by that point.
