---
"@bigcommerce/catalyst-core": patch
---

Fixes the error warning by having a `ProductPickList` with no images, by making the `image` prop optional for when it is not needed.

## Migration

- Update `schema.ts` to allow optional `image` prop for `CardRadioField`
- Update `productOptionsTransformer` switch to have two cases for `ProductPickList`
  - `ProductPickList` with no image object
  - `ProductPickListWithImages` with image object
- Update ui component to make the `image` prop optional and conditionally render the image.
