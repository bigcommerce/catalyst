---
"@bigcommerce/catalyst": patch
---

`catalyst deploy --update-site-url --update-checkout-url` now sets the checkout URL of a storefront on an auto-generated hostname to `https://c.<project>.<zone>` without prompting, then waits for its certificate, which usually takes a minute or two. If no certificate is issued within six minutes, the checkout URL is removed again so checkout keeps working on the default domain. An existing custom checkout URL is left alone, and re-running with an unchanged site URL no longer resets the channel's checkout URL.
