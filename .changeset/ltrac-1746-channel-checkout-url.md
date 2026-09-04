---
"@bigcommerce/catalyst": minor
---

Add `catalyst channels checkout-url` to show, set, or remove a channel's checkout URL.

Checkout is hosted by BigCommerce and the redirect target is resolved server-side from channel config, so a storefront moved onto a Native Hosting domain keeps sending shoppers to whatever checkout domain the channel had before — with nothing in the CLI to inspect or change it. Run with no flags, the command prints the channel's storefront, canonical and checkout URLs, and calls out when the channel has no checkout URL of its own (in which case BigCommerce falls back to the *default* channel's primary URL, which may be an unrelated domain). `--url` sets one, `--unset` reverts to the shared checkout domain and then reports where checkout actually landed, since the domain it falls back to belongs to the default channel and can't be known beforehand.

BigCommerce requires the checkout URL to share a main domain with the channel's storefront URL, so sessions carry between the two. That rule is enforced by the API rather than pre-checked locally — determining the registrable domain correctly requires the public suffix list — so the server's own explanation is surfaced verbatim on rejection. Note this also means a custom checkout URL is only possible on a custom storefront domain, and that the checkout domain must be pointed at BigCommerce with a certificate provisioned there, not added with `catalyst domains add`.
