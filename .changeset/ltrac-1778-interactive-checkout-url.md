---
"@bigcommerce/catalyst": minor
---

`catalyst channels checkout-url` now offers to set a checkout URL instead of only telling you one is needed. With the channel already selected and the site already fetched, it prompts right there — defaulting to the `checkout.` subdomain of the channel's storefront domain — rather than making you re-run the command with `--url`.

The offer is withheld in the two cases where it wouldn't help: when the storefront sits on a BigCommerce-managed hosting zone, where no checkout URL can be issued a certificate and BigCommerce would reject every value, and in non-interactive runs, which print the command to run instead so the command stays scriptable.
