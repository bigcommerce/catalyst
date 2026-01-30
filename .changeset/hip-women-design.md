---
"@bigcommerce/catalyst-core": patch
---

Use state abbreviation instead of entityId for cart shipping form state values. The shipping API expects state abbreviations, not entityIds. Since some states share the same abbreviation across countries (causing Radix UI duplicate key issues), we use a composite value format (`entityId|abbreviation`) and extract the abbreviation when submitting.

## Migration steps

### Step 1

Create a new utility file `core/lib/state-utils.ts` with helper functions for handling composite state values:

```typescript
/**
 * Separator used in composite state values.
 * We use a pipe character to avoid conflicts with hyphens that may appear in abbreviations.
 */
const STATE_VALUE_SEPARATOR = '|';

/**
 * Creates a composite state value from entityId and abbreviation.
 * This format ensures unique values for Radix UI Select components.
 *
 * @param {number} entityId - The state entity ID
 * @param {string} abbreviation - The state abbreviation
 * @returns {string} A composite value in the format "entityId|abbreviation"
 */
export function createStateValue(entityId: number, abbreviation: string): string {
  return `${entityId}${STATE_VALUE_SEPARATOR}${abbreviation}`;
}

/**
 * Extracts the state abbreviation from a composite state value.
 *
 * @param {string | undefined} compositeValue - The composite value in format "entityId|abbreviation"
 * @returns {string | undefined} The state abbreviation, or undefined if the value is invalid
 */
export function parseStateAbbreviation(compositeValue: string | undefined): string | undefined {
  if (!compositeValue) {
    return undefined;
  }

  const separatorIndex = compositeValue.indexOf(STATE_VALUE_SEPARATOR);

  if (separatorIndex === -1) {
    return undefined;
  }

  return compositeValue.slice(separatorIndex + 1);
}
```

### Step 2

Update `core/app/[locale]/(default)/cart/_actions/update-shipping-info.ts` to import and use the utility function:

```diff
+ import { parseStateAbbreviation } from '~/lib/state-utils';
```

Then update both address objects (in the add and update consignment branches):

```diff
            address: {
              countryCode: submission.value.country,
              city: submission.value.city,
-             stateOrProvince: submission.value.state,
+             stateOrProvince: parseStateAbbreviation(submission.value.state),
              postalCode: submission.value.postalCode,
            },
```

### Step 3

Update `core/app/[locale]/(default)/cart/page.tsx` to import the utility functions:

```diff
+ import { createStateValue, parseStateAbbreviation } from '~/lib/state-utils';
```

### Step 4

Update the state select options in `core/app/[locale]/(default)/cart/page.tsx` to use the utility function:

```diff
  const statesOrProvinces = shippingCountries.map((country) => ({
    country: country.code,
    states: country.statesOrProvinces.map((state) => ({
-     value: state.entityId.toString(),
+     value: createStateValue(state.entityId, state.abbreviation),
      label: state.name,
    })),
  }));
```

### Step 5

Add the selected state mapping logic in `core/app/[locale]/(default)/cart/page.tsx` before the return statement to properly initialize the form with the saved shipping address:

```diff
  const checkoutUrl = data.site.settings?.url.checkoutUrl;

+ const selectedStateOrProvince = statesOrProvinces
+   .find((country) => country.country === shippingConsignment?.address.countryCode)
+   ?.states.find(
+     (state) =>
+       parseStateAbbreviation(state.value) === shippingConsignment?.address.stateOrProvince,
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

### Step 6

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
