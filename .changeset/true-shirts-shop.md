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
+           <span aria-hidden="true" className="line-through">
+             {lineItem.price}
+           </span>{' '}
+           {lineItem.salePrice}
          </span>
        ) : (
          <span className="font-medium @xl:ml-auto">{lineItem.price}</span>
        )}
```
