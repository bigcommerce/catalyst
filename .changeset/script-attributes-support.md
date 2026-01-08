---
"@bigcommerce/catalyst-core": patch
---

Add support for additional HTML attributes on script tags. The scripts transformer now extracts and passes through attributes like `async`, `defer`, `crossorigin`, and `data-*` attributes from BigCommerce script tags to the C15T consent manager, ensuring scripts load with their intended behavior.
