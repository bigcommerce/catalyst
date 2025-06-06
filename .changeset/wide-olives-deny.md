---
"@bigcommerce/catalyst-core": patch
---

Remove unused search props, add missing search translations

## Migration

### `core/components/header/index.tsx`

Ensure the following props are passed to the `HeaderSection` navigation prop:
```tsx
        searchInputPlaceholder: t('Search.inputPlaceholder'),
        searchSubmitLabel: t('Search.submitLabel'),
```

### `core/messages/en.json`

Add the following keys to the `Components.Header.Search` translations:
```json
        "somethingWentWrong": "Something went wrong. Please try again.",
        "inputPlaceholder": "Search products, categories, brands...",
        "submitLabel": "Search"
```

### `core/vibes/soul/primitives/navigation/index.tsx`

Copy all changes from this file:
1. Create `searchSubmitLabel?: string;` property, ensure it is passed into `SearchForm`
2. On the `SearchForm`, remove the `searchCtaLabel = 'View more',` property, as it is unused, and rename `submitLabel` to `searchSubmitLabel`
3. Ensure that `SearchForm` passes `searchSubmitLabel` to the `SearchButton`: `<SubmitButton loading={isPending} submitLabel={searchSubmitLabel} />`
4. Remove the `searchCtaLabel` property from the `SearchResults` component
