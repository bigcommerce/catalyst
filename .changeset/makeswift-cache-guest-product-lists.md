---
"@bigcommerce/catalyst-makeswift": patch
---

Let the CDN cache the product data that Makeswift product carousels and lists fetch for guest shoppers. Guest requests now carry their locale and currency in the URL, with product ids sorted, while signed-in shoppers keep using uncached requests.
