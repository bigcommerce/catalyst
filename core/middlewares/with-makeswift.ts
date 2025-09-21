import { unstable_isDraftModeRequest } from '@makeswift/runtime/next/middleware';
import type { NextFetchEvent, NextRequest } from 'next/server';

import { MiddlewareFactory } from './compose-middlewares';

type DraftRequest = Parameters<typeof unstable_isDraftModeRequest>[0];

export const withMakeswift: MiddlewareFactory = (middleware) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    // Both Catalyst and Makeswift ship their own copy of Next.js which leads to
    // the request type being structurally identical but coming from different module paths.
    // A narrow cast keeps the runtime behaviour identical while avoiding type widening to any.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const makeswiftRequest = request as unknown as DraftRequest;
    const isDraftRequest = unstable_isDraftModeRequest(makeswiftRequest);

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
