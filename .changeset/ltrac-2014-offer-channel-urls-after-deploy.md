---
"@bigcommerce/catalyst": patch
---

After an interactive `catalyst deploy`, offer to point the deployed channel at the deployment.

Without `--update-site-url` or `--update-checkout-url`, a deploy used to leave the channel on its `mybigcommerce.com` storefront URL and the default channel's checkout, and said nothing about it. Now, when the deploy runs in a terminal and the channel it was built for (`BIGCOMMERCE_CHANNEL_ID`) doesn't already point at the project:

1. It asks whether to update the channel's site URL, then prompts for the channel (the deployed one is pre-selected) and the hostname (the new deployment is pre-selected).
2. If the site URL is now on an auto-generated hostname and checkout is on another domain, it asks whether to move checkout to `https://c.<project>.<zone>`, and does so the same way `--update-checkout-url` does. Declining prints the cross-domain checkout warning instead.

Declining the site URL is saved per channel in `.bigcommerce/project.json` (`declinedSiteUrlChannels`), and later deploys don't ask again. `catalyst channels update` and the `--update-*` flags still work regardless. Scripted deploys without a TTY, and deploys that pass either flag, behave as before.
