import { NextResponse } from 'next/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { MiddlewareFactory } from '~/middlewares/compose-middlewares';

interface GraphQLQueryResponseBody {
  query: string;
}

function isGraphQLQueryResponseBody(body: unknown): body is GraphQLQueryResponseBody {
  return (
    typeof body === 'object' && body !== null && 'query' in body && typeof body.query === 'string'
  );
}

export const withWalletButtonsProxyRequests: MiddlewareFactory = (next) => {
  return async (request, event) => {
    if (request.nextUrl.pathname.startsWith('/name-me-as-you-wish')) {
      const data: unknown = await request.json();

      if (isGraphQLQueryResponseBody(data)) {
        try {
          const response = await client.fetch({
            document: graphql(data.query),
            customerAccessToken: await getSessionCustomerAccessToken(),
            fetchOptions: { cache: 'no-store' },
          });

          return NextResponse.json(response);
        } catch (error) {
          return NextResponse.json({ error });
        }
      }
    }

    return next(request, event);
  };
};
