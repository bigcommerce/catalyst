import { createClient } from '@bigcommerce/catalyst-client';
import { NextResponse, URLPattern } from 'next/server';
import { z } from 'zod';

import { auth } from '~/auth';
import { backendUserAgent } from '~/user-agent';

import { type ProxyFactory } from './compose-proxies';

const ALLOWED_REQUESTERS = ['checkout-sdk-js'];
const graphqlPathPattern = new URLPattern({ pathname: '/graphql' });

// Dedicated client configured with the unauthenticated storefront token.
// Overriding the Authorization header via fetchOptions doesn't work because
// catalyst-client merges headers in a way that produces a duplicated, comma-
// joined Authorization value.
const unauthenticatedClient = createClient({
  storefrontToken: process.env.BIGCOMMERCE_STOREFRONT_UNAUTHENTICATED_TOKEN ?? '',
  storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
  backendUserAgentExtensions: backendUserAgent,
});

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

        const response = await unauthenticatedClient.fetch({
          document: query,
          variables,
          customerAccessToken,
          fetchOptions: {
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
