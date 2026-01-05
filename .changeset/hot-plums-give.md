---
"@bigcommerce/catalyst-core": minor 
---

Make newsletter signup component on homepage render conditionally based on BigCommerce settings.

## What Changed

- Newsletter signup component (`Subscribe`) on homepage now conditionally renders based on `showNewsletterSignup` setting from BigCommerce.
- Added `showNewsletterSignup` field to `HomePageQuery` GraphQL query to fetch newsletter settings.
- Newsletter signup now uses `Stream` component with `Streamable` pattern for progressive loading.

## Migration

To make newsletter signup component render conditionally based on BigCommerce settings, update your homepage code:

### 1. Update GraphQL Query (`page-data.ts`)

Add the `newsletter` field to your `HomePageQuery`:

```typescript
const HomePageQuery = graphql(
  `
    query HomePageQuery($currencyCode: currencyCode) {
      site {
        // ... existing fields
        settings {
          inventory {
            defaultOutOfStockMessage
            showOutOfStockMessage
            showBackorderMessage
          }
          newsletter {
            showNewsletterSignup
          }
        }
      }
    }
  `,
  [FeaturedProductsCarouselFragment, FeaturedProductsListFragment],
);
```

### 2. Update Homepage Component (`page.tsx`)

Import `Stream` and create a streamable for newsletter settings:

```typescript
import { Stream, Streamable } from '@/vibes/soul/lib/streamable';

// Inside your component, create the streamable:
const streamableShowNewsletterSignup = Streamable.from(async () => {
  const data = await streamablePageData;
  const { showNewsletterSignup } = data.site.settings?.newsletter ?? {};
  return showNewsletterSignup;
});

// Replace direct rendering with conditional Stream:
<Stream fallback={null} value={streamableShowNewsletterSignup}>
  {(showNewsletterSignup) => showNewsletterSignup && <Subscribe />}
</Stream>
```

**Before:**
```typescript
<Subscribe />
```

**After:**
```typescript
<Stream fallback={null} value={streamableShowNewsletterSignup}>
  {(showNewsletterSignup) => showNewsletterSignup && <Subscribe />}
</Stream>
```
