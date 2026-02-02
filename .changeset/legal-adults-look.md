---
"@bigcommerce/catalyst-core": patch
---

Use state abbreviation instead of entityId for cart shipping form state values. The shipping API expects state abbreviations, and using entityId caused form submissions to fail. Additionally, certain US military states that share the same abbreviation (AE) are now filtered out to prevent duplicate key issues and ambiguous submissions.

## Migration steps

### Step 1: Add blacklist for states with duplicate abbreviations

Certain US states share the same abbreviation (AE), which causes issues with the shipping API and React select dropdowns. Add a blacklist to filter these out.

Update `core/app/[locale]/(default)/cart/page.tsx`:

```diff
  const countries = shippingCountries.map((country) => ({
    value: country.code,
    label: country.name,
  }));

+ // These US states share the same abbreviation (AE), which causes issues:
+ // 1. The shipping API uses abbreviations, so it can't distinguish between them
+ // 2. React select dropdowns require unique keys, causing duplicate key warnings
+ const blacklistedUSStates = new Set([
+   'Armed Forces Africa',
+   'Armed Forces Canada',
+   'Armed Forces Middle East',
+ ]);

  const statesOrProvinces = shippingCountries.map((country) => ({
```

### Step 2: Use state abbreviation instead of entityId

Update the state mapping to use `abbreviation` instead of `entityId`, and apply the blacklist filter for US states.

Update `core/app/[locale]/(default)/cart/page.tsx`:

```diff
  const statesOrProvinces = shippingCountries.map((country) => ({
    country: country.code,
-   states: country.statesOrProvinces.map((state) => ({
-     value: state.entityId.toString(),
-     label: state.name,
-   })),
+   states: country.statesOrProvinces
+     .filter((state) => country.code !== 'US' || !blacklistedUSStates.has(state.name))
+     .map((state) => ({
+       value: state.abbreviation,
+       label: state.name,
+     })),
  }));
```
