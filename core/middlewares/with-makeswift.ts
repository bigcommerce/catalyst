import { unstable_createMakeswiftDraftRequest } from '@makeswift/runtime/next/middleware';

import { routing } from '~/i18n/routing';

import { MiddlewareFactory } from './compose-middlewares';

import { parse as parseCookie } from 'set-cookie-parser';
import { serialize as serializeCookie } from 'cookie';

if (!process.env.MAKESWIFT_SITE_API_KEY) {
  throw new Error('MAKESWIFT_SITE_API_KEY is not set');
}

const SET_COOKIE_HEADER = 'set-cookie';
const MIDDLEWARE_SET_COOKIE_HEADER = 'x-middleware-set-cookie';

const MAKESWIFT_SITE_API_KEY = process.env.MAKESWIFT_SITE_API_KEY;

const localeCookieName = ({ localeCookie }: { localeCookie?: boolean | { name?: string } }) =>
  (typeof localeCookie === 'object' ? localeCookie.name : undefined) ?? 'NEXT_LOCALE';

function removeLocaleCookieFromCookieString(cookieString: string): string | null {
  const cookies = parseCookie(cookieString);
  const serializedCookiesWithoutLocale = cookies
    .filter((cookie) => cookie.name !== localeCookieName(routing))
    .map((cookie) => serializeCookie(cookie.name, cookie.value));

  const header = new Headers();
  serializedCookiesWithoutLocale.forEach((cookie) => header.append(SET_COOKIE_HEADER, cookie));
  return header.get(SET_COOKIE_HEADER);
}

function replaceOrRemoveCookieFromHeader(headers: Headers, key: string): void {
  const currentCookies = headers.get(key);
  if (currentCookies == null) return;
  const cookiesWithoutLocale = removeLocaleCookieFromCookieString(currentCookies);
  if (cookiesWithoutLocale === null) {
    headers.delete(key);
  } else {
    headers.set(key, cookiesWithoutLocale);
  }
}

export const withMakeswift: MiddlewareFactory = (middleware) => {
  return async (request, event) => {
    const draftRequest = await unstable_createMakeswiftDraftRequest(
      request,
      MAKESWIFT_SITE_API_KEY,
    );

    if (draftRequest != null) {
      if (routing.localeCookie) {
        // If the i18n middleware is configured to use a cookie, it will first try to derive the
        // locale from the existing request cookie before attempting to match the URL against the
        // locale routes. The locale switcher in the Makeswift Builder expects the host to always
        // determine the locale from the URL, though, so we have to erase the cookie from the
        // proxied request to force that behavior.
        draftRequest.cookies.delete(localeCookieName(routing));
      }

      const response = await middleware(draftRequest, event);
      if (response == null) return response;

      replaceOrRemoveCookieFromHeader(response.headers, SET_COOKIE_HEADER);
      replaceOrRemoveCookieFromHeader(response.headers, MIDDLEWARE_SET_COOKIE_HEADER);

      return response;
    }

    return middleware(request, event);
  };
};
