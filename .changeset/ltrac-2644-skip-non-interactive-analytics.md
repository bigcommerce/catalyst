---
"@bigcommerce/catalyst-core": patch
---

Stop sending the `VisitStarted` and `ProductViewed` analytics events for requests that aren't page navigations from a browser, such as bots, crawlers, scripts and fetch or subresource requests. These clients rarely keep cookies, so each of their requests previously sent an uncached analytics mutation to BigCommerce.
