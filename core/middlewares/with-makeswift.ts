import { unstable_isDraftModeRequest } from '@makeswift/runtime/next/middleware';

import { MiddlewareFactory } from './compose-middlewares';

export const withMakeswift: MiddlewareFactory = (middleware) => {
  return async (request, event) => {
    const isDraftRequest = unstable_isDraftModeRequest(request as any);

    if (isDraftRequest) {
      // Makeswift Builder's locale switcher expects the host to derive locale strictly from
      // the URL. Disable cookie- and language-based locale detection when in draft mode to
      // meet this expectation.
      request.headers.set('x-bc-disable-locale-detection', 'true');

      return await middleware(request, event);
    }

    return middleware(request, event);
  };
};
