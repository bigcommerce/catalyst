---
"@bigcommerce/catalyst-core": patch
---

Improve accessibility for price displays by adding screen reader announcements for original prices, sale prices, and price ranges. Visual price elements are hidden from assistive technologies using `aria-hidden="true"` to prevent duplicate announcements, while visually hidden text provides context about pricing information.

## Migration steps

### Step 1: Update Cart Price Display

Update `core/vibes/soul/sections/cart/client.tsx` to add accessibility labels for sale prices:

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

### Step 2: Update PriceLabel Component

Update `core/vibes/soul/primitives/price-label/index.tsx` to add accessibility improvements for sale prices and price ranges:

```diff
  import { clsx } from 'clsx';
+ import { useTranslations } from 'next-intl';

  export function PriceLabel({ className, colorScheme = 'light', price }: Props) {
+   const t = useTranslations('Components.Price');

    if (typeof price === 'string') {
      return (
        ...
      );
    }

    switch (price.type) {
      case 'range':
        return (
          <span ...>
-           {price.minValue}
-           &nbsp;&ndash;&nbsp;
-           {price.maxValue}
+           <span className="sr-only">
+             {t('range', { minValue: price.minValue, maxValue: price.maxValue })}
+           </span>
+           <span aria-hidden="true">
+             {price.minValue} - {price.maxValue}
+           </span>
          </span>
        );

      case 'sale':
        return (
          <span className={clsx('block font-semibold', className)}>
+           <span className="sr-only">{t('originalPrice', { price: price.previousValue })}</span>
            <span
+             aria-hidden="true"
              className={clsx(
                'font-normal line-through opacity-50',
                ...
              )}
            >
              {price.previousValue}
            </span>{' '}
+           <span className="sr-only">{t('currentPrice', { price: price.currentValue })}</span>
            <span
+             aria-hidden="true"
              className={clsx(
                ...
              )}
            >
              {price.currentValue}
            </span>
          </span>
        );
    }
  }
```

### Step 3: Add Translation Keys

Update `core/messages/en.json` to include new translation keys for price accessibility:

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
+   "originalPrice": "Original price was {price}.",
+   "currentPrice": "Current price is {price}.",
```

```diff
    },
+   "Price": {
+     "originalPrice": "Original price was {price}.",
+     "currentPrice": "Current price is {price}.",
+     "range": "Price from {minValue} to {maxValue}."
+   }
  },
  "GiftCertificates": {
```