import { unstable_createMakeswiftDraftRequest } from '@makeswift/runtime/next/middleware';
import { NextResponse } from 'next/server';
import { splitCookiesString } from 'set-cookie-parser';

import { routing } from '~/i18n/routing';

import { MiddlewareFactory } from './compose-middlewares';

if (!process.env.MAKESWIFT_SITE_API_KEY) {
  throw new Error('MAKESWIFT_SITE_API_KEY is not set');
}

const MAKESWIFT_SITE_API_KEY = process.env.MAKESWIFT_SITE_API_KEY;

const localeCookieName = ({ localeCookie }: { localeCookie?: boolean | { name?: string } }) =>
  (typeof localeCookie === 'object' ? localeCookie.name : undefined) ?? 'NEXT_LOCALE';

const stripSetLocaleCookieHeaders = (response: NextResponse | Response) => {
  const cookieName = localeCookieName(routing);
  const isLocaleCookie = (value: string) => value.startsWith(`${cookieName}=`);

  response.headers.forEach((value, name) => {
    if (name === 'set-cookie') {
      if (isLocaleCookie(value)) {
        response.headers.delete(name);
      }
    }

    if (name === 'x-middleware-set-cookie') {
      // In contrast to the 'set-cookie' header, Next.js' 'x-middleware-set-cookie' header may
      // contain multiple comma-separated cookie values in a single header--see
      // https://github.com/vercel/next.js/blob/canary/packages/next/src/server/web/spec-extension/response.ts#L60
      const values = splitCookiesString(value).filter((v) => !isLocaleCookie(v));

      if (values.length > 0) {
        response.headers.set(name, values.join(','));
      } else {
        response.headers.delete(name);
      }
    }
  });
};

export const withMakeswift: MiddlewareFactory = (middleware) => {
  return async (request, event) => {
    const draftRequest = await unstable_createMakeswiftDraftRequest(
      request,
      MAKESWIFT_SITE_API_KEY,
    );

    if (draftRequest != null) {
      const response = await middleware(draftRequest, event);

      // If the i18n middleware is configured to use a cookie, it will first try to derive the
      // locale from the existing request cookie before attempting to match the URL against the
      // locale routes. The locale switcher in the Makeswift Builder expects the host to always
      // determine the locale from the URL, though. To enable that behavior, we prevent the
      // locale cookie from being set in response to all draft requests.
      if (response != null) stripSetLocaleCookieHeaders(response);

      return response;
    }

    return middleware(request, event);
  };
};
