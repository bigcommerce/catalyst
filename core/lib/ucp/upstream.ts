import { buildConfig } from '~/build-config/reader';

/**
 * Marks a request as already having passed through the UCP proxy.
 */
export const UCP_PROXY_MARKER = 'x-catalyst-ucp-proxy';

/**
 * Headers forwarded to the canonical domain, taken from the UCP REST transport spec:
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

// Whether the pathname is one of the UCP endpoints proxied to the canonical domain.
export const isUcpPath = (pathname: string): boolean =>
  UCP_PATHNAMES.some((pattern) => pattern.test(pathname));

// Maps a storefront UCP URL onto the store's canonical domain, preserving the query string.
export const buildUpstreamUrl = (requestUrl: URL): URL => {
  const { vanityUrl } = buildConfig.get('urls');
  const pathname = requestUrl.pathname.replace(/\/+$/, '') || '/';
  const upstreamUrl = new URL(pathname, vanityUrl);

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

  headers.set(UCP_PROXY_MARKER, '1');

  return headers;
};

// Copies the spec's response headers back to the client, dropping everything else.
export const buildDownstreamHeaders = (upstreamHeaders: Headers): Headers =>
  copyAllowedHeaders(
    upstreamHeaders,
    FORWARDED_RESPONSE_HEADERS,
    FORWARDED_RESPONSE_HEADER_PREFIXES,
  );
