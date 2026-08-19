---
"@bigcommerce/catalyst-core": patch
---

Only show the "ready to ship" quantity message in the cart when part of the line item is also backordered. Previously it appeared any time `showQuantityOnHand` was enabled and any quantity was on hand, even for fully in-stock items where the message added no useful information.
