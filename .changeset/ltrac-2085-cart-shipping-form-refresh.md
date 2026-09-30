---
'@bigcommerce/catalyst-core': patch
---

Fix the cart shipping estimator not updating until a page reload. After "View shipping options", "Add shipping", or a quantity change, the shipping form now reflects the new address, quote, and selected option immediately.

## Migration

In `core/vibes/soul/sections/cart/client.tsx`, key the `ShippingForm` on the server's shipping state so it remounts when that state changes:

```tsx
{shipping && (
  <ShippingForm
    key={JSON.stringify([
      shipping.address,
      shipping.shippingOptions,
      shipping.shippingOption?.value,
      shipping.showShippingForm,
    ])}
    {...shipping}
  />
)}
```
