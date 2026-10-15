---
'@bigcommerce/catalyst-core': patch
---

Add the product the shopper is viewing to the cart, even if the product page's hidden `id` field was edited. The add to cart form now sets the product ID from its `productId` prop right before calling the action, so changing the field in devtools or with a script no longer adds a different product. The hidden input stays so add to cart still works without JavaScript.

## Migration

In `core/vibes/soul/sections/product-detail/product-detail-form.tsx`, set the product ID in the `onSubmit` handler before calling the action:

```ts
onSubmit(event, { formData }) {
  event.preventDefault();

  // Use the product from props, not the hidden field, so editing the form can't add a different product.
  formData.set('id', productId);

  startTransition(() => {
    formAction(formData);

    events.onAddToCart?.(formData);
  });
},
```
