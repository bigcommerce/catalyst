---
"@bigcommerce/catalyst-makeswift": patch
---

Cache `/api/products/[entityId]` for guest shoppers, and skip the BigCommerce customer group request in `/api/customer/group` when no shopper is logged in.
