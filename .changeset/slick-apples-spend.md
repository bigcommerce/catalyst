---
"@bigcommerce/catalyst-core": patch
---

- Added optional `salePrice?: string` property to the `CartLineItem` interface
- Cart UI now displays sale prices with a strikethrough on the original price when `salePrice` is provided and differs from `price`

## Migration

If you're using the `Cart` component with custom line items, you can now optionally include a `salePrice` property:

```tsx
const lineItems = [
  {
    // ... other properties
    price: '$100.00',
    salePrice: '$80.00', // Optional: when provided, displays as strikethrough price + sale price
  },
];
```

### Backward Compatibility

This change is **fully backward compatible**. The `salePrice` property is optional, so existing implementations will continue to work without modification. If `salePrice` is not provided or equals `price`, only the regular price will be displayed.