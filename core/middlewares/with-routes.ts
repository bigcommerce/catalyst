import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
// import { z } from 'zod';

import { getSessionCustomerId } from '~/auth';
// import { graphql } from '~/client/graphql';
import { getRawWebPageContent } from '~/client/queries/get-raw-web-page-content';
import { getRoute } from '~/client/queries/get-route';

import { defaultLocale, localePrefix, LocalePrefixes, locales } from '../i18n';

import { type MiddlewareFactory } from './compose-middlewares';

// const StorefrontStatusCacheSchema = z.object({
//   status: z.union([
//     z.literal('HIBERNATION'),
//     z.literal('LAUNCHED'),
//     z.literal('MAINTENANCE'),
//     z.literal('PRE_LAUNCH'),
//   ]),
// });

let locale: string;
const clearLocaleFromPath = (path: string) => {
  let res: string;

  if (localePrefix === LocalePrefixes.ALWAYS) {
    res = locale ? `/${path.split('/').slice(2).join('/')}` : path;

    return res;
  }

  if (localePrefix === LocalePrefixes.ASNEEDED) {
    res = locale && locale !== defaultLocale ? `/${path.split('/').slice(2).join('/')}` : path;

    return res;
  }

  return path;
};

const getRouteInfo = async (request: NextRequest) => {
  try {
    const pathname = clearLocaleFromPath(request.nextUrl.pathname);
    const route = await getRoute(pathname);

    return {
      route,
      status: 'LAUNCHED' as const,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    return {
      route: undefined,
      status: undefined,
    };
  }
};

export const withRoutes: MiddlewareFactory = () => {
  return async (request) => {
    locale = cookies().get('NEXT_LOCALE')?.value || '';

    const intlMiddleware = createMiddleware({
      locales,
      localePrefix,
      defaultLocale,
      localeDetection: true,
    });
    const response = intlMiddleware(request);

    // Early redirect to detected locale if needed
    if (response.redirected) {
      return response;
    }

    if (!locale) {
      // Try to get locale detected by next-intl
      locale = response.cookies.get('NEXT_LOCALE')?.value || '';
    }

    // const { route, status } = await getRouteInfo(request);
    const { route } = await getRouteInfo(request);

    // if (status === 'MAINTENANCE') {
    //   // 503 status code not working - https://github.com/vercel/next.js/issues/50155
    //   return NextResponse.rewrite(new URL(`/${locale}/maintenance`, request.url), { status: 503 });
    // }

    // Follow redirects if found on the route
    // Use 301 status code as it is more universally supported by crawlers
    const redirectConfig = { status: 301 };

    if (route?.redirect) {
      switch (route.redirect.to.__typename) {
        case 'ManualRedirect': {
          // For manual redirects, redirect to the full URL to handle cases
          // where the destination URL might be external to the site
          return NextResponse.redirect(route.redirect.toUrl, redirectConfig);
        }

        default: {
          // For all other cases, assume an internal redirect and construct the URL
          // based on the current request URL to maintain internal redirection
          // in non-production environments
          const redirectPathname = new URL(route.redirect.toUrl).pathname;
          const redirectUrl = new URL(redirectPathname, request.url);

          return NextResponse.redirect(redirectUrl, redirectConfig);
        }
      }
    }

    const customerId = await getSessionCustomerId();
    let postfix = '';

    if (!request.nextUrl.search && !customerId && request.method === 'GET') {
      postfix = '/static';
    }

    const node = route?.node;
    let url: string;

    switch (node?.__typename) {
      case 'Brand': {
        url = `/${locale}/brand/${node.entityId}${postfix}`;
        break;
      }

      case 'Category': {
        url = `/${locale}/category/${node.entityId}${postfix}`;
        break;
      }

      case 'Product': {
        url = `/${locale}/product/${node.entityId}${postfix}`;
        break;
      }

      case 'NormalPage': {
        url = `/${locale}/webpages/normal/${node.id}`;
        break;
      }

      case 'ContactPage': {
        url = `/${locale}/webpages/contact/${node.id}`;
        break;
      }

      case 'RawHtmlPage': {
        const { htmlBody } = await getRawWebPageContent(node.id);

        return new NextResponse(htmlBody, {
          headers: { 'content-type': 'text/html' },
        });
      }

      default: {
        const { pathname } = new URL(request.url);
        const cleanPathName = clearLocaleFromPath(pathname);

        if (cleanPathName === '/' && postfix) {
          url = `/${locale}${postfix}`;
          break;
        }

        url = `/${locale}${cleanPathName}`;
      }
    }

    const rewriteUrl = new URL(url, request.url);

    rewriteUrl.search = request.nextUrl.search;

    const rewrite = NextResponse.rewrite(rewriteUrl);

    // Add rewrite header to response provided by next-intl
    rewrite.headers.forEach((v, k) => response.headers.set(k, v));

    return response;
  };
};
