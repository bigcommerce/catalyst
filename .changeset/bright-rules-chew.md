---
"@bigcommerce/catalyst-core": patch
---

Filter out child cart items (items with `parentEntityId`) from cart and cart analytics to prevent duplicate line items when products have parent-child relationships, such as product bundles.

## Migration steps

### Step 1: GraphQL Fragment Updates

The `parentEntityId` field has been added to both physical and digital cart item fragments to identify child items.

Update `core/app/[locale]/(default)/cart/page-data.ts`:

```diff
  export const PhysicalItemFragment = graphql(`
    fragment PhysicalItemFragment on CartPhysicalItem {
      entityId
      quantity
      productEntityId
      variantEntityId
+     parentEntityId
      listPrice {
        currencyCode
        value
      }
    }
  `);

  export const DigitalItemFragment = graphql(`
    fragment DigitalItemFragment on CartDigitalItem {
      entityId
      quantity
      productEntityId
      variantEntityId
+     parentEntityId
      listPrice {
        currencyCode
        value
      }
    }
  `);
```

### Step 2: Cart Display Filtering

Cart line items are now filtered to exclude child items when displaying the cart.

Update `core/app/[locale]/(default)/cart/page.tsx`:

```diff
  const lineItems = [
    ...cart.lineItems.giftCertificates,
    ...cart.lineItems.physicalItems,
    ...cart.lineItems.digitalItems,
- ];
+ ].filter((item) => !('parentEntityId' in item) || !item.parentEntityId);
```

### Step 3: Analytics Data Filtering

Analytics data collection now only includes top-level items to prevent duplicate tracking.

Update `core/app/[locale]/(default)/cart/page.tsx` in the `getAnalyticsData` function:

```diff
- const lineItems = [...cart.lineItems.physicalItems, ...cart.lineItems.digitalItems];
+ const lineItems = [...cart.lineItems.physicalItems, ...cart.lineItems.digitalItems].filter(
+   (item) => !item.parentEntityId, // Only include top-level items
+ );
```

### Step 4: Styling Update

Cart subtitle text color has been updated for improved contrast.

Update `core/vibes/soul/sections/cart/client.tsx`:

```diff
-                  <span className="text-[var(--cart-subtext-text,hsl(var(--contrast-300)))] contrast-more:text-[var(--cart-subtitle-text,hsl(var(--contrast-500)))]">
+                  <span className="text-[var(--cart-subtext-text,hsl(var(--contrast-400)))] contrast-more:text-[var(--cart-subtitle-text,hsl(var(--contrast-500)))]">
                     {lineItem.subtitle}
                   </span>
```