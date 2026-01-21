---
"@bigcommerce/catalyst-core": patch
---

Remove decorative price element from accessibility tree by adding `aria-hidden="true"`, improving screen reader experience by preventing duplicate price announcements.

## Migration

Update `core/vibes/soul/sections/cart/client.tsx`:

```diff
        {lineItem.salePrice && lineItem.salePrice !== lineItem.price ? (
          <span className="font-medium @xl:ml-auto">
-           <span className="line-through">{lineItem.price}</span> {lineItem.salePrice}
+           <span className="sr-only">{t('originalPrice', { price: lineItem.price })}</span>
+           <span aria-hidden="true" className="line-through">
+             {lineItem.price}
+           </span>{' '}
+           <span className="sr-only">{t('currentPrice', { price: lineItem.salePrice })}</span>
+           <span aria-hidden="true">{lineItem.salePrice}</span>
          </span>
        ) : (
          <span className="font-medium @xl:ml-auto">{lineItem.price}</span>
        )}
```

Update `core/messages/en.json` to include new dictionary labels.

```diff
  "Cart": {
    "title": "Cart",
    "heading": "Your cart",
    "proceedToCheckout": "Proceed to checkout",
    "increment": "Increase quantity",
    "decrement": "Decrease quantity",
    "removeItem": "Remove item",
    "cartCombined": "We noticed you had items saved in a previous cart, so we've added them to your current cart for you.",
    "cartRestored": "You started a cart on another device, and we've restored it here so you can pick up where you left off.",
    "cartUpdateInProgress": "You have a cart update in progress. Are you sure you want to leave this page? Your changes may be lost.",
+    "originalPrice": "Original price was {price}.",
+    "currentPrice": "Current price is {price}.",
```