import { unstable_isDraftModeRequest as isDraftModeRequest } from '@makeswift/runtime/next/middleware';
import { NextRequest } from 'next/server';

import { routing } from '~/i18n/routing';

import { MiddlewareFactory } from './compose-middlewares';

const localeCookieName = ({ localeCookie }: { localeCookie?: boolean | { name?: string } }) =>
  (typeof localeCookie === 'object' ? localeCookie.name : undefined) ?? 'NEXT_LOCALE';

export const withMakeswift: MiddlewareFactory = (middleware) => {
  return async (request, event) => {
    if (isDraftModeRequest(request) && routing.localeCookie) {
      // The locale switcher in the Makeswift Builder expects locale to be determined
      // from the URL, not from a cookie. Erase it so the intl middleware uses the URL.
      const draftRequest = new NextRequest(request.url, { headers: request.headers });

      draftRequest.cookies.delete(localeCookieName(routing));

      return middleware(draftRequest, event);
    }

    return middleware(request, event);
  };
};
