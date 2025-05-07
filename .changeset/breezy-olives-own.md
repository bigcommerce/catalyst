---
"@bigcommerce/catalyst-core": patch
---

 - Update the account pages to match the style of VIBES and remain consistent with the rest of Catalyst.
 - Updated OrderDetails line items styling to display cost of each item and the selected `productOptions`
 - Created OrderDetails skeletons
 - Updated /account/orders/[id] to use `Streamable`

## Migration

1. Copy all changes in the `/core/vibes/soul` directory
2. Copy all changes in the `/core/app/[locale]/(default)/account` directory
