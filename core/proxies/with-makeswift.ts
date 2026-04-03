import { unstable_isDraftModeRequest } from '@makeswift/runtime/next/middleware';

import { type ProxyFactory } from './compose-proxies';

export const withMakeswift: ProxyFactory = (proxy) => {
  return async (request, event) => {
    const isDraftRequest = unstable_isDraftModeRequest(request);

    if (isDraftRequest) {
      // Makeswift Builder's locale switcher expects the host to derive locale strictly from
      // the URL. Disable cookie- and language-based locale detection when in draft mode to
      // meet this expectation.
      request.headers.set('x-bc-disable-locale-detection', 'true');

      return await proxy(request, event);
    }

    return proxy(request, event);
  };
};
