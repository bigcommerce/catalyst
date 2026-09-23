---
"@bigcommerce/catalyst": patch
---

Set a channel's checkout URL to the checkout hostname native hosting provisions, instead of prompting for one.

`catalyst deploy --update-site-url --update-checkout-url` asked the merchant to type a checkout URL, defaulting to a `checkout.` subdomain that nothing would ever provision on a managed hosting zone. It now derives the hostname that native hosting actually creates — the storefront hostname with a short prefix — and sets it without prompting.

The hostname is derived rather than transported. ignition builds the same name from the same prefix, so carrying it over the API would only add a field that can disagree with reality, and would have required a `bc-interfaces` release.

Before writing, the CLI waits for that hostname to serve a valid certificate. `PUT /v3/channels/:id/site/checkout-url` performs no certificate validation of its own — it accepts any hostname sharing a main domain with the storefront, whether or not anything answers there — so setting it too early would leave checkout resolving without a certificate, which is worse for a shopper than the inherited checkout URL it replaced. Provisioning takes up to six minutes, and the CLI gives up with a warning rather than writing a URL that would not work.

Nothing changes for a storefront on a custom domain, or when `--update-checkout-url` is used without `--update-site-url`: both still prompt, since there is no provisioned hostname to derive from.
