---
"@bigcommerce/catalyst": patch
---

After an interactive `catalyst deploy`, offer to point the deployed channel at the deployment.

Without `--update-site-url` or `--update-checkout-url`, a deploy used to leave the channel on its `mybigcommerce.com` storefront URL and the default channel's checkout, and said nothing about it. Now, when the deploy runs in a terminal and the channel it serves (`BIGCOMMERCE_CHANNEL_ID`, from a stored or `--secret` deployment variable first, then the env files) doesn't already point at the project:

1. It asks whether to point that channel's site URL at the deployment, and sets it to the hostname the deploy just went live on. Neither the channel nor the hostname is asked for; the hostname picker only appears if the deploy didn't report one.
2. If the site URL is now on an auto-generated hostname and checkout is on another domain, it asks whether to move checkout to `https://c.<project>.<zone>`, and does so the same way `--update-checkout-url` does. Declining prints the cross-domain checkout warning instead.

Declining the site URL is saved per channel in `.bigcommerce/project.json` (`declinedSiteUrlChannels`), and later deploys don't ask again. `catalyst channels update` and the `--update-*` flags still work regardless. Scripted deploys without a TTY, and deploys that pass either flag, behave as before.
