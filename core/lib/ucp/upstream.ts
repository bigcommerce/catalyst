import { getChannelIdFromLocale } from '~/channels.config';
import { buildChannelOrigin } from '~/lib/bigcommerce-origin';

/**
 * Marks a request as already having passed through the UCP proxy.
 */
export const UCP_PROXY_MARKER = 'x-catalyst-ucp-proxy';

/**
 * Headers forwarded upstream, taken from the UCP REST transport spec:
 * https://ucp.dev/2026-04-08/specification/checkout-rest/
 */
const FORWARDED_REQUEST_HEADERS = new Set([
  'accept',
  'accept-language',
  'authorization',
  'content-digest',
  'content-type',
  'idempotency-key',
  'if-match',
  'if-modified-since',
  'if-none-match',
  'if-unmodified-since',
  'origin',
  'request-id',
  'signature',
  'signature-agent',
  'signature-input',
  'ucp-agent',
  'user-agent',
  'x-api-key',
]);

const FORWARDED_REQUEST_HEADER_PREFIXES = ['ucp-', 'access-control-request-'];

const FORWARDED_RESPONSE_HEADERS = new Set([
  'access-control-allow-headers',
  'access-control-allow-methods',
  'access-control-allow-origin',
  'access-control-expose-headers',
  'access-control-max-age',
  'allow',
  'cache-control',
  'content-digest',
  'content-language',
  'content-type',
  'etag',
  'last-modified',
  'location',
  'request-id',
  'retry-after',
  'signature',
  'signature-input',
  'vary',
  'www-authenticate',
]);

const FORWARDED_RESPONSE_HEADER_PREFIXES = ['ucp-', 'ratelimit-', 'x-ratelimit-', 'x-rate-limit-'];

const copyAllowedHeaders = (source: Headers, allowed: Set<string>, prefixes: string[]): Headers => {
  const headers = new Headers();

  source.forEach((value, key) => {
    const name = key.toLowerCase();

    if (allowed.has(name) || prefixes.some((prefix) => name.startsWith(prefix))) {
      headers.set(key, value);
    }
  });

  return headers;
};

const UCP_PATHNAMES = [/^\/\.well-known\/ucp\/?$/, /^\/api\/ucp(\/.*)?$/];

export const isUcpPath = (pathname: string): boolean =>
  UCP_PATHNAMES.some((pattern) => pattern.test(pathname));

// Not the channel's `vanityUrl`: Catalyst points the channel's site at its own deployment
// hostname, so proxying there would loop straight back into this proxy.
const getUpstreamOrigin = (): string | null => {
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH;
  const channelId = getChannelIdFromLocale();

  if (!storeHash || !channelId) {
    return null;
  }

  return buildChannelOrigin(storeHash, channelId);
};

// Upstream answers a trailing slash with a 307 to the bare path, so it never gets one.
const stripTrailingSlash = (pathname: string): string => pathname.replace(/\/+$/, '') || '/';

export const buildUpstreamUrl = (requestUrl: URL): URL | null => {
  const upstreamOrigin = getUpstreamOrigin();

  if (!upstreamOrigin) {
    return null;
  }

  // Upstream verifies the signed authority against the channel’s storefront host, so the
  // proxy can forward the signature unchanged: upstream handles the rewrite, so validation
  // does not fail.
  const upstreamUrl = new URL(stripTrailingSlash(requestUrl.pathname), upstreamOrigin);

  upstreamUrl.search = requestUrl.search;

  return upstreamUrl;
};

// Forwards only the headers the UCP spec defines. Credentials are among them, because UCP
// authenticates the calling agent at the platform rather than at Catalyst.
export const buildUpstreamHeaders = (request: Request): Headers => {
  const headers = copyAllowedHeaders(
    request.headers,
    FORWARDED_REQUEST_HEADERS,
    FORWARDED_REQUEST_HEADER_PREFIXES,
  );

  // Disable compression so the response body still matches the forwarded digest and signature.
  headers.set('accept-encoding', 'identity');
  headers.set(UCP_PROXY_MARKER, '1');

  return headers;
};

export const buildDownstreamHeaders = (upstreamHeaders: Headers): Headers =>
  copyAllowedHeaders(
    upstreamHeaders,
    FORWARDED_RESPONSE_HEADERS,
    FORWARDED_RESPONSE_HEADER_PREFIXES,
  );
