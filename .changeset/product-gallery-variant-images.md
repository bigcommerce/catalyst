---
'@bigcommerce/catalyst-core': patch
---

Fix the product gallery not updating when selecting a variant with a different default image.

## Migration

In `core/vibes/soul/sections/product-detail/index.tsx`, key both `ProductGallery` usages on their image sources so the gallery remounts when the selected variant changes the images:

```tsx
<ProductGallery
  images={imagesData.images}
  key={imagesData.images.map(({ src }) => src).join()}
  ...
/>
```
