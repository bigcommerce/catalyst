import { NextResponse, URLPattern } from 'next/server';
import { z } from 'zod';

import { auth } from '~/auth';
import { client } from '~/client';
import { parseAllowedWalletOperation } from '~/lib/graphql-proxy/wallet-operations';

import { type ProxyFactory } from './compose-proxies';

const ALLOWED_REQUESTERS = ['checkout-sdk-js'];
const graphqlPathPattern = new URLPattern({ pathname: '/graphql{/}?' });

const bodySchema = z.object({
  query: z.string().min(1),
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

    let body: unknown;

    try {
      // Clone so auth() can still read the body.
      body = await request.clone().json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parsedBody = bodySchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid GraphQL request' }, { status: 400 });
    }

    const { query, variables } = parsedBody.data;

    // The requester header can be spoofed, so only relay wallet operations.
    const document = parseAllowedWalletOperation(query);

    if (!document) {
      return NextResponse.json({ error: 'Operation not allowed' }, { status: 403 });
    }

    // Wrap in auth to get customer access token for customer-specific data
    return auth(async (req) => {
      try {
        // Get customer access token if authenticated
        const customerAccessToken = req.auth?.user?.customerAccessToken;

        // Proxy the request using the existing client with an unauthenticated storefront token
        const response = await client.fetch({
          document,
          variables,
          customerAccessToken,
          fetchOptions: {
            headers: {
              Authorization: `Bearer ${process.env.BIGCOMMERCE_STOREFRONT_UNAUTHENTICATED_TOKEN ?? ''}`,
            },
            cache: 'no-store',
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
