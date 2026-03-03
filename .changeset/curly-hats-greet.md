---
"@bigcommerce/catalyst-core": minor
---

All GraphQL requests now include an `X-Correlation-ID` header containing a UUID that is stable for the duration of a single page render (via `React.cache`), making it easier to trace and correlate all requests made during a single render in server logs.

Guest (unauthenticated) queries are now cached using `unstable_cache` with the configured revalidation interval, while authenticated requests continue to use `cache: 'no-store'`. This separates cacheable public data from session-specific data, improving performance for unauthenticated visitors. The `X-Forwarded-For` and `True-Client-IP` headers are only forwarded on uncached (`no-store`) requests since they are unavailable inside `unstable_cache`.

## Migration

### Step 1: Add the correlation ID helper

Create `core/client/correlation-id.ts`:

```ts
import { cache } from 'react';

/**
 * Returns a stable correlation ID for the current request.
 * React.cache ensures the same UUID is returned for all fetches within a
 * single page render, while being unique across renders/requests.
 */
export const getCorrelationId = cache((): string => crypto.randomUUID());
```

### Step 2: Update `core/client/index.ts`

Update the `beforeRequest` hook to add the `X-Correlation-ID` header to all requests and to only forward `X-Forwarded-For` / `True-Client-IP` on uncached requests:

```diff
+ import { getCorrelationId } from './correlation-id';

  export const client = createClient({
    ...
    beforeRequest: async (fetchOptions) => {
      const requestHeaders: Record<string, string> = {};

-     try {
-       const ipAddress = (await headers()).get('X-Forwarded-For');
-       if (ipAddress) {
-         requestHeaders['X-Forwarded-For'] = ipAddress;
-         requestHeaders['True-Client-IP'] = ipAddress;
-       }
-     } catch {
-       // Not in a request context
-     }
+     if (fetchOptions?.cache && ['no-store', 'no-cache'].includes(fetchOptions.cache)) {
+       try {
+         // headers() is a dynamic API unavailable inside unstable_cache; skip IP forwarding in that context
+         const ipAddress = (await headers()).get('X-Forwarded-For');
+         if (ipAddress) {
+           requestHeaders['X-Forwarded-For'] = ipAddress;
+           requestHeaders['True-Client-IP'] = ipAddress;
+         }
+       } catch {
+         // Not in a request context (e.g. inside unstable_cache); IP forwarding not available
+       }
+     }
+
+     requestHeaders['X-Correlation-ID'] = getCorrelationId();

      return { headers: requestHeaders };
    },
  });
```

### Step 3: Wrap guest queries with `unstable_cache`

For each page data file, wrap the guest (unauthenticated) fetch in `unstable_cache` and branch on whether a `customerAccessToken` is present. Example pattern:

```diff
+ import { unstable_cache } from 'next/cache';
  import { cache } from 'react';
+ import { revalidate } from '~/client/revalidate-target';

+ const getCachedPageData = unstable_cache(
+   async (locale: string, ...args) => {
+     const { data } = await client.fetch({
+       document: PageQuery,
+       variables: { ... },
+       locale,
+       fetchOptions: { cache: 'no-store' },
+     });
+     return data;
+   },
+   ['cache-key'],
+   { revalidate },
+ );

  export const getPageData = cache(
-   async (locale: string, customerAccessToken?: string) => {
-     const { data } = await client.fetch({
-       document: PageQuery,
-       locale,
-       fetchOptions: { cache: 'no-store' },
-     });
-     return data;
-   },
+   async (locale: string, customerAccessToken?: string) => {
+     if (customerAccessToken) {
+       const { data } = await client.fetch({
+         document: PageQuery,
+         customerAccessToken,
+         locale,
+         fetchOptions: { cache: 'no-store' },
+       });
+       return data;
+     }
+     return getCachedPageData(locale);
+   },
  );
```
