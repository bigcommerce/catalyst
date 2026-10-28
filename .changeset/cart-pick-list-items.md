---
'@bigcommerce/catalyst-core': minor
---

Show the products a pick list option adds to the cart under their parent line item, instead of hiding them. Each one keeps its pick list option's label and shows its own selected options, and its quantity only when it differs from the parent's. The parent's price already includes them, so they have no price of their own.

Migration: `CartLineItem` gains an optional `includedItems` array and the `Cart` section an optional `includedItemsLabel` prop. Add the `Cart.includedItems` message if you maintain your own translations.
