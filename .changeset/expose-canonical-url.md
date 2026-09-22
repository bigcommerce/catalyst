---
"@bigcommerce/catalyst-client": minor
---

Expose `getCanonicalUrl()` as a public method. It returns the BigCommerce-managed storefront URL for a channel, which is where the platform serves that channel's storefront routes. This differs from the channel's configured site URL (`site.settings.url.vanityUrl`) — on a headless channel that points at the headless app — so it is the correct value to use when reaching a platform-served route for the current channel.
