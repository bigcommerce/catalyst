---
"@bigcommerce/catalyst-core": minor
---

Add Meta Pixel analytics provider support

Adds a Meta Pixel (Facebook Pixel) provider to the Catalyst analytics
framework, following the same architecture as the Google Analytics provider.
Merchants who configure a Meta Pixel in their store settings (surfaced via
`webAnalytics.metaPixel.pixelId` in the GraphQL Storefront API) get standard
e-commerce event tracking alongside or instead of GA4.

- `MetaPixelProvider` implementing the `AnalyticsProvider` interface, typed with
  `@types/facebook-pixel` (no `any`).
- Meta Consent Mode: consent is applied via `fbq('consent', …)` before init so
  the pixel stays dormant until marketing consent is granted.
- Standard events (`ViewContent`, `AddToCart`) use `fbq('track', …)`; events
  without a Meta standard equivalent (`ViewCart`, `RemoveFromCart`,
  `ViewCategory`) use `fbq('trackCustom', …)`.
- Each event carries an `eventID` for browser ↔ Conversions API deduplication.
