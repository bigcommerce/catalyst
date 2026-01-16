---
"@bigcommerce/catalyst-core": minor
---

Add GraphQL proxy to enable client-side GraphQL requests through the storefront. This proxy forwards requests from allowed clients (such as checkout-sdk-js) to the BigCommerce Storefront API using a dedicated unauthenticated storefront token for API authorization, while still passing through the customer access token for customer-specific data. No browser cookies are forwarded.

## Migration

### Step 1: Add environment variable

Add a `BIGCOMMERCE_STOREFRONT_UNAUTHENTICATED_TOKEN` to your `.env.local`. This should be a storefront API token scoped for client-side proxy use with minimal permissions.

### Step 2: Create proxy

Create a new file `core/proxies/with-graphql-proxy.ts`:

```ts
import { NextResponse, URLPattern } from 'next/server';
import { z } from 'zod';

import { auth } from '~/auth';
import { client } from '~/client';

import { type ProxyFactory } from './compose-proxies';

const ALLOWED_REQUESTERS = ['checkout-sdk-js'];
const graphqlPathPattern = new URLPattern({ pathname: '/graphql' });

const bodySchema = z.object({
  query: z.unknown(),
  variables: z.record(z.unknown()).default({}),
});

export const withGraphqlProxy: ProxyFactory = (next) => {
  return async (request, event) => {
    // Only handle /graphql path
    if (!graphqlPathPattern.test(request.nextUrl.toString())) {
      return next(request, event);
    }

    const requester = request.headers.get('x-catalyst-graphql-proxy-requester');

    // Validate required header
    if (!requester || !ALLOWED_REQUESTERS.includes(requester)) {
      return next(request, event);
    }

    // Only handle POST requests
    if (request.method !== 'POST') {
      return new NextResponse('Method not allowed', { status: 405 });
    }

    // Wrap in auth to get customer access token for customer-specific data
    return auth(async (req) => {
      try {
        // Parse incoming GraphQL request body
        const body: unknown = await req.json();
        const { query, variables } = bodySchema.parse(body);

        if (!query) {
          return NextResponse.json({ error: 'Missing query' }, { status: 400 });
        }

        // Get customer access token if authenticated
        const customerAccessToken = req.auth?.user?.customerAccessToken;

        // Proxy the request using the existing client with an unauthenticated storefront token
        const response = await client.fetch({
          document: query,
          variables,
          customerAccessToken,
          fetchOptions: {
            headers: {
              Authorization: `Bearer ${process.env.BIGCOMMERCE_STOREFRONT_UNAUTHENTICATED_TOKEN}`,
            },
            next: { revalidate: 0 },
          },
        });

        return NextResponse.json(response);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        return NextResponse.json(error, { status: 500 });
      }
      // @ts-expect-error auth() overload expects middleware return type, but we return NextResponse directly for the proxy
    })(request, event);
  };
};
```

### Step 3: Register proxy

Update `core/proxy.ts` to include the new proxy in the composition chain:

```diff
  import { composeProxies } from './proxies/compose-proxies';
  import { withAnalyticsCookies } from './proxies/with-analytics-cookies';
  import { withAuth } from './proxies/with-auth';
  import { withChannelId } from './proxies/with-channel-id';
+ import { withGraphqlProxy } from './proxies/with-graphql-proxy';
  import { withIntl } from './proxies/with-intl';
  import { withRoutes } from './proxies/with-routes';

  export const proxy = composeProxies(
    withAuth,
    withAnalyticsCookies,
    withIntl,
    withChannelId,
+   withGraphqlProxy,
    withRoutes,
  );
```

The `withGraphqlProxy` proxy should be placed after `withChannelId` and before `withRoutes` in the chain.
