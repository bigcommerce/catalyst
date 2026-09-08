import {
  buildDownstreamHeaders,
  buildUpstreamHeaders,
  buildUpstreamUrl,
  isUcpPath,
  UCP_PROXY_MARKER,
} from '~/lib/ucp/upstream';

import { type ProxyFactory } from './compose-proxies';

const UPSTREAM_TIMEOUT_MS = 15_000;
const METHODS_WITHOUT_BODY = ['GET', 'HEAD'];

// Proxies the UCP endpoints to the store's canonical domain, as UCP is served by the
// BigCommerce platform rather than by Catalyst. This must run first in the proxy chain
// so that locale rewriting, BigCommerce route resolution and anonymous session creation
// are all bypassed.
export const withUcpProxy: ProxyFactory = (next) => {
  return async (request, event) => {
    if (!isUcpPath(request.nextUrl.pathname)) {
      return next(request, event);
    }

    const upstreamUrl = buildUpstreamUrl(request.nextUrl);

    if (request.headers.has(UCP_PROXY_MARKER) || upstreamUrl.host === request.nextUrl.host) {
      return Response.json({ error: 'UCP proxy loop detected' }, { status: 508 });
    }

    const body = METHODS_WITHOUT_BODY.includes(request.method)
      ? undefined
      : await request.arrayBuffer();

    try {
      const upstreamResponse = await fetch(upstreamUrl, {
        method: request.method,
        headers: buildUpstreamHeaders(request),
        body,
        redirect: 'manual',
        cache: 'no-store',
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });

      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: buildDownstreamHeaders(upstreamResponse.headers),
      });
    } catch (error) {
      const timedOut = error instanceof Error && error.name === 'TimeoutError';

      // eslint-disable-next-line no-console
      console.error(`UCP proxy failed to reach ${upstreamUrl.origin}`, error);

      return Response.json(
        { error: timedOut ? 'Gateway Timeout' : 'Bad Gateway' },
        { status: timedOut ? 504 : 502 },
      );
    }
  };
};
