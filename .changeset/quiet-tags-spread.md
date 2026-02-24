---
"@bigcommerce/catalyst-core": patch
---

Conditionally include optional SEO metadata fields in `generateMetadata` across page files. Fields `description`, `keywords`, `alternates`, and `openGraph` are now only included in the returned metadata object when they have a value, using spread syntax (`...(value && { key: value })`). Previously, these fields were always set — potentially assigning `null` or an empty string — which could cause Next.js to render empty `<meta>` tags.

## Migration steps

Update `generateMetadata` in the following pages to use conditional spread syntax for optional metadata fields:

### brand, category, webpages (contact + normal)

```diff
  return {
    title: pageTitle || entity.name,
-   description: metaDescription,
-   keywords: metaKeywords ? metaKeywords.split(',') : null,
+   ...(metaDescription && { description: metaDescription }),
+   ...(metaKeywords && { keywords: metaKeywords.split(',') }),
  };
```

For `brand/[slug]/page.tsx`, also guard the `alternates` field:

```diff
-   alternates: await getMetadataAlternates({ path: brand.path, locale }),
+   ...(brand.path && { alternates: await getMetadataAlternates({ path: brand.path, locale }) }),
```

### blog/[blogId]/page.tsx

```diff
  return {
    title: pageTitle || blogPost.name,
-   description: metaDescription,
-   keywords: metaKeywords ? metaKeywords.split(',') : null,
+   ...(metaDescription && { description: metaDescription }),
+   ...(metaKeywords && { keywords: metaKeywords.split(',') }),
    ...(blogPost.path && {
      alternates: await getMetadataAlternates({ path: blogPost.path, locale }),
    }),
  };
```

### product/[slug]/page.tsx

```diff
- keywords: metaKeywords ? metaKeywords.split(',') : null,
+ ...(metaKeywords && { keywords: metaKeywords.split(',') }),
- openGraph: url
-   ? {
-       images: [{ url, alt }],
-     }
-   : null,
+ ...(url && { openGraph: { images: [{ url, alt }] } }),
```

### blog/page.tsx

Extract the description to a variable and spread conditionally:

```diff
+ const description =
+   blog?.description && blog.description.length > 150
+     ? `${blog.description.substring(0, 150)}...`
+     : blog?.description;
+
  return {
    title: blog?.name ?? t('title'),
-   description:
-     blog?.description && blog.description.length > 150
-       ? `${blog.description.substring(0, 150)}...`
-       : blog?.description,
+   ...(description && { description }),
    ...(blog?.path && { alternates: await getMetadataAlternates({ path: blog.path, locale }) }),
  };
```
