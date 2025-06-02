---
"@bigcommerce/catalyst-core": minor
---

Implement the new analytics provider, utilizing the GoogleAnalytics provider as the first analytics solution.


Most changes are additive so merge conflicts should be easy to resolve. In order to use the new provider from the previous provider, if it's already not setup in the BigCommerce control panel for checkout analytics, you'll need to add the GA4 property ID. This will automatically be used by the new GoogleAnalytics provider.

