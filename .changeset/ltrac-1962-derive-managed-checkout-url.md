---
"@bigcommerce/catalyst": patch
---

Put checkout on the same domain as a native-hosted storefront. For a storefront on an auto-generated hostname, the checkout URL is `https://c.<project>.<zone>`:

- `catalyst deploy --update-site-url --update-checkout-url` sets it without prompting.
- An interactive `catalyst deploy` without those flags offers to point the channel at the deployment and to move its checkout there. Both questions default to No, and declining is remembered per channel in `.bigcommerce/project.json`.
- `catalyst channels update` offers it after changing a site URL.

After setting it, the CLI waits for the certificate, which usually takes a minute or two. If none is issued within six minutes, the checkout URL is removed so checkout keeps working on the default domain. An existing custom checkout URL is left alone, and re-running with an unchanged site URL no longer resets the checkout URL. Nothing is asked without a terminal or in CI.
