---
"@bigcommerce/catalyst-core": patch
---

Remove "Exclusive Offers" field temporarily. Currently, the field is not fully implemented in GraphQL, so it may be misleading to display it on the storefront if it's not actually doing anything when registering a customer.

Once the Register Customer operation takes this field into account, we can display it again.

## Migration

Update `core/app/[locale]/(default)/(auth)/register/page.tsx` and add the function:
```ts
// There is currently a GraphQL gap where the "Exclusive Offers" field isn't accounted for
// during customer registration, so the field should not be shown on the Catalyst storefront until it is hooked up.
function removeExlusiveOffersField(field: Field | Field[]): boolean {
  if (Array.isArray(field)) {
    // Exclusive offers field will always have ID '25', since it is made upon store creation and is also read-only.
    return !field.some((f) => f.id === '25');
  }

  return field.id !== '25';
}
```

Then, add the following code at the end of the `const fields` declaration:
```ts
    })
    .filter(exists)
    .filter(removeExlusiveOffersField); // <---
```
