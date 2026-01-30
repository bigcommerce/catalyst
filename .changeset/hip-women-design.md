---
"@bigcommerce/catalyst-core": patch
---

Use state abbreviation instead of entityId for cart shipping form state values. The shipping API expects state abbreviations, not entityIds. Since some states share the same abbreviation across countries (causing Radix UI duplicate key issues), we use a composite value format (`entityId-abbreviation`) and extract the abbreviation when submitting.

## Migration steps

### Step 1

Update `core/app/[locale]/(default)/cart/_actions/update-shipping-info.ts` to extract the abbreviation from the composite value (in both the add and update consignment branches):

```diff
            address: {
              countryCode: submission.value.country,
              city: submission.value.city,
-             stateOrProvince: submission.value.state,
+             stateOrProvince: submission.value.state?.split('-')[1],
              postalCode: submission.value.postalCode,
            },
```

### Step 2

Update the state select options in `core/app/[locale]/(default)/cart/page.tsx` to use composite values:

```diff
  const statesOrProvinces = shippingCountries.map((country) => ({
    country: country.code,
    states: country.statesOrProvinces.map((state) => ({
-     value: state.entityId.toString(),
+     value: `${state.entityId}-${state.abbreviation}`,
      label: state.name,
    })),
  }));
```

### Step 3

Add the selected state mapping logic in `core/app/[locale]/(default)/cart/page.tsx` before the return statement to properly initialize the form with the saved shipping address:

```diff
  const checkoutUrl = data.site.settings?.url.checkoutUrl;

+ const selectedStateOrProvince = statesOrProvinces
+   .find((country) => country.country === shippingConsignment?.address.countryCode)
+   ?.states.find(
+     (state) => state.value.split('-')[1] === shippingConsignment?.address.stateOrProvince,
+   )?.value;
+
+ const selectedAddress = shippingConsignment?.address
+   ? {
+       country: shippingConsignment.address.countryCode,
+       city:
+         shippingConsignment.address.city !== ''
+           ? (shippingConsignment.address.city ?? undefined)
+           : undefined,
+       state:
+         shippingConsignment.address.stateOrProvince !== '' ? selectedStateOrProvince : undefined,
+       postalCode:
+         shippingConsignment.address.postalCode !== ''
+           ? (shippingConsignment.address.postalCode ?? undefined)
+           : undefined,
+     }
+   : undefined;

  return (
```

### Step 4

Update the `ShippingEstimator` address prop in `core/app/[locale]/(default)/cart/page.tsx`:

```diff
            action: updateShippingInfo,
            countries,
            states: statesOrProvinces,
-           address: shippingConsignment?.address
-             ? {
-                 country: shippingConsignment.address.countryCode,
-                 city:
-                   shippingConsignment.address.city !== ''
-                     ? (shippingConsignment.address.city ?? undefined)
-                     : undefined,
-                 state:
-                   shippingConsignment.address.stateOrProvince !== ''
-                     ? (shippingConsignment.address.stateOrProvince ?? undefined)
-                     : undefined,
-                 postalCode:
-                   shippingConsignment.address.postalCode !== ''
-                     ? (shippingConsignment.address.postalCode ?? undefined)
-                     : undefined,
-               }
-             : undefined,
+           address: selectedAddress,
```
