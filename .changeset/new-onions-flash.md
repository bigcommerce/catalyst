---
"@bigcommerce/catalyst-core": patch
---

Add canonical URLs and hreflang alternates for SEO. Pages now set `alternates.canonical` and `alternates.languages` in `generateMetadata` via the new `getMetadataAlternates` helper in `core/lib/seo/canonical.ts`. The default locale uses no path prefix; other locales use `/{locale}/path`. The root locale layout sets `metadataBase` to the configured vanity URL so canonical URLs resolve correctly.

## Migration steps

### Step 1: Root layout metadata base

Set `metadataBase` in the root locale layout so canonical URLs resolve to your vanity URL.

Update `core/app/[locale]/layout.tsx`:

```diff
  import { Providers } from '~/app/providers';
+ import { buildConfig } from '~/build-config/reader';
  import { client } from '~/client';
  ...
  return {
+   metadataBase: new URL(buildConfig.get('urls').vanityUrl),
    title: {
```

### Step 2: GraphQL fragment updates

Add the `path` field to brand, blog post, and product queries so metadata can build canonical URLs.

Update `core/app/[locale]/(default)/(faceted)/brand/[slug]/page-data.ts`:

```diff
  site {
    brand(entityId: $entityId) {
      name
+     path
      seo {
```

Update `core/app/[locale]/(default)/blog/[blogId]/page-data.ts`:

```diff
  author
  htmlBody
  name
+ path
  publishedDate {
```

Update `core/app/[locale]/(default)/product/[slug]/page-data.ts` (in the metadata query):

```diff
  site {
    product(entityId: $entityId) {
      name
+     path
      defaultImage {
```

### Step 3: Page metadata alternates

Add the `getMetadataAlternates` import and set `alternates` in `generateMetadata` for each page. Ensure `core/lib/seo/canonical.ts` exists (it is included in this release).

Update `core/app/[locale]/(default)/page.tsx` (home):

```diff
+ import { Metadata } from 'next';
  import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
  ...
+ import { getMetadataAlternates } from '~/lib/seo/canonical';
  ...
+ export async function generateMetadata({ params }: Props): Promise<Metadata> {
+   const { locale } = await params;
+   return {
+     alternates: getMetadataAlternates({ path: '/', locale }),
+   };
+ }
+
  export default async function Home({ params }: Props) {
```

For entity pages (product, category, brand, blog, blog post, webpage), add the import and include `alternates` in the existing `generateMetadata` return value using the entity `path` (or breadcrumb-derived path for category and webpage). Example for a brand page:

```diff
+ import { getMetadataAlternates } from '~/lib/seo/canonical';
  ...
  export async function generateMetadata(props: Props): Promise<Metadata> {
-   const { slug } = await props.params;
+   const { slug, locale } = await props.params;
    ...
    return {
      title: pageTitle || brand.name,
      description: metaDescription,
      keywords: metaKeywords ? metaKeywords.split(',') : null,
+     alternates: getMetadataAlternates({ path: brand.path, locale }),
    };
  }
```
