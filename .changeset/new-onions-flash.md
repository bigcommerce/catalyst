---
"@bigcommerce/catalyst-core": patch
---

Add canonical URLs and hreflang alternates for SEO. Pages now set `alternates.canonical` and `alternates.languages` in `generateMetadata` via the new `getMetadataAlternates` helper in `core/lib/seo/canonical.ts`. The helper fetches the vanity URL via GraphQL (`site.settings.url.vanityUrl`) and is cached per request. The default locale uses no path prefix; other locales use `/{locale}/path`. The root locale layout sets `metadataBase` to the configured vanity URL so canonical URLs resolve correctly. On Vercel preview deployments (`VERCEL_ENV=preview`), `metadataBase` and canonical/hreflang URLs use `VERCEL_URL` instead of the production vanity URL to prevent preview environments from generating SEO metadata pointing to production.

## Migration steps

### Step 1: Root layout metadata base

The root locale layout now sets `metadataBase` from the vanity URL fetched via GraphQL. On Vercel preview deployments, `VERCEL_URL` is used instead so preview environments don't point to production.

Update `core/app/[locale]/layout.tsx`:

```diff
+ const vanityUrl = data.site.settings?.url.vanityUrl;
+
+ const isPreview = process.env.VERCEL_ENV === 'preview';
+ const baseUrl =
+   isPreview && process.env.VERCEL_URL
+     ? new URL(`https://${process.env.VERCEL_URL}`)
+     : vanityUrl
+       ? new URL(vanityUrl)
+       : undefined;
+
  return {
+   metadataBase: baseUrl,
    title: {
```

### Step 2: Canonical/hreflang base URL for preview environments

The `getVanityUrl` helper in `core/lib/seo/canonical.ts` now returns `VERCEL_URL` on preview deployments, skipping the GraphQL query.

Update `core/lib/seo/canonical.ts`:

```diff
 const getVanityUrl = cache(async () => {
+  const isPreview = process.env.VERCEL_ENV === 'preview';
+
+  if (isPreview && process.env.VERCEL_URL) {
+    return `https://${process.env.VERCEL_URL}`;
+  }
+
   const { data } = await client.fetch({
```

### Step 3: GraphQL fragment updates

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

### Step 4: Page metadata alternates

Add the `getMetadataAlternates` import and set `alternates` in `generateMetadata` for each page. The function is async and must be awaited. Ensure `core/lib/seo/canonical.ts` exists (it is included in this release).

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
+     alternates: await getMetadataAlternates({ path: '/', locale }),
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
+     alternates: await getMetadataAlternates({ path: brand.path, locale }),
    };
  }
```

### Step 5: Gift certificates pages

Update `core/app/[locale]/(default)/gift-certificates/page.tsx`:

```diff
+ import { getMetadataAlternates } from '~/lib/seo/canonical';
  ...
  export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'GiftCertificates' });

    return {
      title: t('title') || 'Gift certificates',
+     alternates: await getMetadataAlternates({ path: '/gift-certificates', locale }),
    };
  }
```

Update `core/app/[locale]/(default)/gift-certificates/balance/page.tsx`:

```diff
+ import { getMetadataAlternates } from '~/lib/seo/canonical';
  ...
    return {
      title: t('title') || 'Gift certificates - Check balance',
+     alternates: await getMetadataAlternates({ path: '/gift-certificates/balance', locale }),
    };
```

Add `generateMetadata` to `core/app/[locale]/(default)/gift-certificates/purchase/page.tsx`:

```diff
+ import { Metadata } from 'next';
  import { getFormatter, getTranslations } from 'next-intl/server';
  ...
+ import { getMetadataAlternates } from '~/lib/seo/canonical';
  ...
+ export async function generateMetadata({ params }: Props): Promise<Metadata> {
+   const { locale } = await params;
+   const t = await getTranslations({ locale, namespace: 'GiftCertificates' });
+
+   return {
+     title: t('Purchase.title'),
+     alternates: await getMetadataAlternates({ path: '/gift-certificates/purchase', locale }),
+   };
+ }
```

### Step 6: Contact page

Update `core/app/[locale]/(default)/webpages/[id]/contact/page.tsx`:

```diff
+ import { getMetadataAlternates } from '~/lib/seo/canonical';
  ...
  export async function generateMetadata({ params }: Props): Promise<Metadata> {
-   const { id } = await params;
+   const { id, locale } = await params;
    const webpage = await getWebPage(id);
    const { pageTitle, metaDescription, metaKeywords } = webpage.seo;

    return {
      title: pageTitle || webpage.title,
      description: metaDescription,
      keywords: metaKeywords ? metaKeywords.split(',') : null,
+     alternates: await getMetadataAlternates({ path: webpage.path, locale }),
    };
  }
```

### Step 7: Public wishlist page

Update `core/app/[locale]/(default)/wishlist/[token]/page.tsx`:

```diff
+ import { getMetadataAlternates } from '~/lib/seo/canonical';
  ...
  export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { locale, token } = await params;
    ...
    return {
      title: wishlist?.name ?? t('title'),
+     alternates: await getMetadataAlternates({ path: `/wishlist/${token}`, locale }),
    };
  }
```

### Step 8: Compare page

Update `core/app/[locale]/(default)/compare/page.tsx`:

```diff
+ import { getMetadataAlternates } from '~/lib/seo/canonical';
  ...
  export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Compare' });

    return {
      title: t('title'),
+     alternates: await getMetadataAlternates({ path: '/compare', locale }),
    };
  }
```
