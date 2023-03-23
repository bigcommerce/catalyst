import { gql } from '@apollo/client';
import { getIronSession } from 'iron-session/edge';
import { NextResponse, URLPattern } from 'next/server';
import type { NextRequest } from 'next/server';

import { serverClient } from './client/server';
import { handleSession, productViewed, sessionOptions } from './session';

interface RoutesResponse {
  site: {
    route: {
      node: {
        __typename: string;
        entityId: string;
      } | null;
    };
  };
}

// This is a POC middleware intended to redirect all page requests to the right NextJS route.
// TODO: Internationalization, trailing slash, etc.
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession(request, response, sessionOptions);

  await handleSession(request, session);

  const { data } = await serverClient.query<RoutesResponse>({
    query: gql`
      query Routes($path: String!) {
        site {
          route(path: $path) {
            node {
              __typename
              ... on Product {
                entityId
              }
              ... on Category {
                entityId
              }
              ... on Brand {
                entityId
              }
            }
          }
        }
      }
    `,
    variables: { path: request.nextUrl.pathname },
  });

  switch (data.site.route.node?.__typename) {
    case 'Product':
      await productViewed(session, parseInt(data.site.route.node.entityId, 10));

      return NextResponse.rewrite(
        new URL(`/product/${data.site.route.node.entityId}`, request.url),
        response,
      );

    case 'Category':
      return NextResponse.rewrite(
        new URL(`/category/${data.site.route.node.entityId}`, request.url),
        response,
      );
  }

  // These are paths we want to hide from customers as it's internal to our application.
  // We rewrite to these paths using merchants custom URLs for each entity.
  const OBFUSCATED_PATTERNS = [
    new URLPattern('/product/:pid(\\d+)', request.nextUrl.origin),
    new URLPattern('/category/:cid(\\d+)', request.nextUrl.origin),
    new URLPattern('/brand/:bid(\\d+)', request.nextUrl.origin),
  ];

  // Prevent customers from directly navigating to a obfuscated URL.
  if (OBFUSCATED_PATTERNS.find((pattern) => pattern.exec(request.url))) {
    return NextResponse.redirect(new URL('/404', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/',
  ],
};
