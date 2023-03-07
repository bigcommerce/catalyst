import { gql } from '@apollo/client';
import { NextResponse, URLPattern } from 'next/server';
import type { NextRequest } from 'next/server';

import { serverClient } from './client/server';
import { Page } from './components/Header';

interface RoutesResponse {
  site: {
    route: {
      node: {
        __typename: string;
        entityId: string;
      } | null;
    };
    content: {
      pages: {
        edges: Array<{
          node: Page;
        }>;
      };
    };
  };
}

// This is a POC middleware intended to redirect all page requests to the right NextJS route.
// TODO: Internationalization, trailing slash, etc.
export async function middleware(request: NextRequest) {
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
          content {
            pages {
              edges {
                node {
                  __typename
                  entityId
                  name
                  parentEntityId
                  ... on NormalPage {
                    path
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: { path: request.nextUrl.pathname },
  });

  // Temporary workaround until Route endpoint includes Pages
  const pagesMap: { [path: string]: number } = {};

  data.site.content.pages.edges.forEach(({ node }) => {
    if (node.__typename === 'NormalPage') {
      const pathWithoutEndingSlash =
        node.path[node.path.length - 1] === '/'
          ? node.path.slice(0, node.path.length - 1)
          : node.path;

      pagesMap[pathWithoutEndingSlash] = node.entityId;
    }
  });

  if (pagesMap[request.nextUrl.pathname]) {
    return NextResponse.rewrite(
      new URL(`/page/${pagesMap[request.nextUrl.pathname]}`, request.url),
    );
  }

  switch (data.site.route.node?.__typename) {
    case 'Product':
      return NextResponse.rewrite(
        new URL(`/product/${data.site.route.node.entityId}`, request.url),
      );

    case 'Category':
      return NextResponse.rewrite(
        new URL(`/category/${data.site.route.node.entityId}`, request.url),
      );
  }

  // These are paths we want to hide from customers as it's internal to our application.
  // We rewrite to these paths using merchants custom URLs for each entity.
  const OBFUSCATED_PATTERNS = [
    new URLPattern('/product/:pid(\\d+)', request.nextUrl.origin),
    new URLPattern('/category/:cid(\\d+)', request.nextUrl.origin),
    new URLPattern('/brand/:bid(\\d+)', request.nextUrl.origin),
    new URLPattern('/page/:pageid(\\d+)', request.nextUrl.origin),
  ];

  // Prevent customers from directly navigating to an obfuscated URL.
  if (OBFUSCATED_PATTERNS.find((pattern) => pattern.exec(request.url))) {
    return NextResponse.redirect(new URL('/404', request.url));
  }

  return NextResponse.next();
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
  ],
};
