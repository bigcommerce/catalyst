---
'@bigcommerce/catalyst-core': patch
---

Fix the cart, product, compare and wishlist sections remounting when their analytics data finishes streaming, which could discard queued cart changes and add-to-cart results. Add-to-cart and remove-from-cart analytics events fired before that data arrives are now sent once it does, instead of being dropped.
