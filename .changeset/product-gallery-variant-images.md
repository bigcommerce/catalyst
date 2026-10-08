---
'@bigcommerce/catalyst-core': patch
---

Fix the product gallery not updating when selecting a variant with a different default image.

## Migration

In `core/vibes/soul/sections/product-detail/index.tsx`, key both `ProductGallery` usages on the first image so the gallery remounts when the variant's default image changes:

```tsx
<ProductGallery
  images={imagesData.images}
  key={imagesData.images[0]?.src}
  ...
/>
```
