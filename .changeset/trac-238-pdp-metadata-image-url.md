---
"@bigcommerce/catalyst-core": patch
---

Fix the product page `og:image` tag pointing at an unfetchable URL. `ProductPageMetadataQuery` requested `urlTemplate`, which returns a URL containing a literal `{:size}` placeholder that the `<Image>` CDN loader substitutes at render time. `generateMetadata` has no such loader, so the placeholder was emitted verbatim into the Open Graph tag.

## Migration

In `core/app/[locale]/(default)/product/[slug]/page-data.ts`, update the `defaultImage` selection in `ProductPageMetadataQuery` to request a concrete URL:

```diff
  defaultImage {
    altText
-   url: urlTemplate(lossy: true)
+   url(width: 1200, lossy: true)
  }
```

`width: 1200` matches the Open Graph and `summary_large_image` recommendation. Height is omitted intentionally — the stencil resizer fits the image inside the given box rather than cropping, so requesting `1200x630` would return a smaller square image for a square product photo.
