---
"@bigcommerce/catalyst-core": minor
---

Make it easier to negotiate locale inside of API routes by passing client locale as a search parameter in the client fetch request.

## Migration

1. Collect all `route.ts` files that serve responses to requests that originate from Makeswift components. In the default `integrations/makeswift` branch, that list is:
   a. `core/app/api/products/[entityId]/route.ts`
   b. `core/app/api/products/group/[group]/route.ts`
   c. `core/app/api/products/ids/route.ts`
2. Add the code to each `route.ts` file required to parse and validate that locale. That code typically looks like:

   ```
   // ...
   import { hasLocale } from 'next-intl';
   import { routing } from '~/i18n/routing';

   // Then, inside of the route hander:
     const searchParams = request.nextUrl.searchParams;
     const locale = searchParams.get('locale') ?? routing.defaultLocale;

     if (!hasLocale(routing.locales, locale)) {
       return NextResponse.json(
         { status: 'error', error: 'Invalid locale parameter' },
         { status: 400 },
       )
     }
   ```

3. At this point, you now have the locale available in your API route to do whatever you'd like with; [in this PR](https://github.com/bigcommerce/catalyst/pull/2286), we pass locale to `client.fetch` and add some conditional logic inside of `fetchOptions` to set the `"Accept-Language"` header based on locale.
4. Finally, don't forget to pass locale as a search parameter from client `fetch()` calls!
