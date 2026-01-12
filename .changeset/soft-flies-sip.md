---
"@bigcommerce/catalyst-core": patch
---

Fix data-disabled class selectors in UI components

## Migration

Updated Tailwind CSS class selectors from `data-disabled:` to `data-[disabled]:` in the following components:

- `vibes/soul/form/button-radio-group/index.tsx`
- `vibes/soul/form/card-radio-group/index.tsx`
- `vibes/soul/form/radio-group/index.tsx`
- `vibes/soul/form/rating-radio-group/index.tsx`
- `vibes/soul/form/swatch-radio-group/index.tsx`
- `vibes/soul/form/switch/index.tsx`
- `vibes/soul/primitives/dropdown-menu/index.tsx`

If you have customized any of these components, update your class names:

```diff
- data-disabled:pointer-events-none data-disabled:opacity-50
+ data-[disabled]:pointer-events-none data-[disabled]:opacity-50
```

This change ensures proper styling of disabled states using the correct Tailwind CSS data attribute syntax.
