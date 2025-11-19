---
"@bigcommerce/catalyst-core": minor
---

Add Meta Pixel analytics provider support

This change adds a new Meta Pixel (Facebook Pixel) analytics provider to the Catalyst analytics framework. The implementation follows the same architecture pattern as the existing Google Analytics provider, allowing merchants to track e-commerce events using Meta Pixel for advertising and analytics purposes.

**Features:**
- Meta Pixel provider implementation with full event tracking support
- Consent management integration for GDPR/CCPA compliance
- Support for multiple analytics providers simultaneously (GA4 + Meta Pixel)
- Standard e-commerce events: ViewContent, AddToCart, RemoveFromCart, ViewCart, ViewCategory

**Configuration:**
Merchants can configure Meta Pixel by adding `metaPixel { pixelId }` to their BigCommerce store settings. The GraphQL fragment has been updated to support fetching Meta Pixel configuration.

**Note:** This implementation requires the BigCommerce GraphQL schema to include `metaPixel` in `webAnalytics`. Platform support may be required for full functionality.
