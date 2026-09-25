---
"@bigcommerce/catalyst": patch
---

After an interactive `catalyst deploy`, offer to point the deployed channel at the deployment and to put its checkout on the same domain.

Without `--update-site-url` or `--update-checkout-url`, a deploy used to leave the channel on its `mybigcommerce.com` storefront URL and the default channel's checkout, and said nothing about it. Now, when the deploy runs in a terminal and knows the channel it serves (`BIGCOMMERCE_CHANNEL_ID`, from a stored or `--secret` deployment variable first, then the env files), it checks two things on every deploy:

1. **Site URL.** If the channel doesn't point at the project, it asks whether to point it at the deployment, and sets it to the hostname the deploy just went live on. Neither the channel nor the hostname is asked for; the hostname picker only appears if the deploy didn't report one.
2. **Checkout URL.** If the channel's storefront is on an auto-generated hostname and checkout is on another domain, it asks whether to move checkout to `https://c.<project>.<zone>`, and does so the way `--update-checkout-url` does. This is checked on its own, so it's offered even when the site URL was set earlier or some other way. A custom checkout URL the merchant set on another domain is left alone.

Both questions default to No, so pressing Enter never changes a live channel. Declining either is saved per channel in `.bigcommerce/project.json` (`declinedSiteUrlChannels`, `declinedCheckoutUrlChannels`), and that offer isn't made again after deploys. Declining checkout also prints the cross-domain checkout warning and the command that sets it.

`catalyst channels update` makes the same checkout offer after it updates a site URL, since that update deletes the channel's checkout URL. As an explicit command it asks even after an earlier decline. It falls back to the cross-domain warning when there's nothing to offer.

Runs without a TTY or with `CI` set, and deploys or updates that pass a checkout flag, behave as before, so CI pipelines never wait on a prompt.
