---
"@bigcommerce/catalyst-makeswift": patch
---

Fix sort order of `additionalProducts` prop in `ProductsCarousel` Makeswift component.
Sort product IDs before sending requests to BC so cache can be utilized in `ProductCarousel`
