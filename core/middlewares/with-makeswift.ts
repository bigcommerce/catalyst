import { unstable_createMakeswiftDraftRequest } from '@makeswift/runtime/next/middleware';

import { MiddlewareFactory } from './compose-middlewares';

if (!process.env.MAKESWIFT_SITE_API_KEY) {
  throw new Error('MAKESWIFT_SITE_API_KEY is not set');
}

const MAKESWIFT_SITE_API_KEY = process.env.MAKESWIFT_SITE_API_KEY;

export const withMakeswift: MiddlewareFactory = (middleware) => {
  return async (request, event) => {
    const draftRequest = await unstable_createMakeswiftDraftRequest(
      request,
      MAKESWIFT_SITE_API_KEY,
    );

    if (draftRequest != null) {
      // Makeswift Builder's locale switcher expects the host to derive locale strictly from
      // the URL. Disable cookie- and language-based locale detection when in draft mode to
      // meet this expectation.
      draftRequest.headers.set('x-bc-disable-locale-detection', 'true');

      return await middleware(draftRequest, event);
    }

    return middleware(request, event);
  };
};
