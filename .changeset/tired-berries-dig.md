---
"@bigcommerce/catalyst-core": patch
---

Upon logout, reestablish the cart if we are just unassigning it. If persistent cart is enabled, the cart will not be reestablished on the session as we have separate logic to merge carts upon login.
