import { describe, expect, it, vi } from 'vitest';

import {
  buildDownstreamHeaders,
  buildUpstreamHeaders,
  buildUpstreamUrl,
  isUcpPath,
  UCP_PROXY_MARKER,
} from './upstream';

const VANITY_URL = 'https://example.mybigcommerce.com';

vi.mock('~/build-config/reader', () => ({
  buildConfig: {
    get: () => ({ vanityUrl: VANITY_URL, cdnUrls: ['cdn11.bigcommerce.com'], checkoutUrl: '' }),
  },
}));

const storefrontRequest = (path: string, headers: Record<string, string> = {}) =>
  new Request(`https://storefront.example.com${path}`, {
    headers: { host: 'storefront.example.com', ...headers },
  });

describe('isUcpPath', () => {
  it.each([
    '/.well-known/ucp',
    '/.well-known/ucp/',
    '/api/ucp',
    '/api/ucp/',
    '/api/ucp/checkout_sessions',
    '/api/ucp/checkout_sessions/',
    '/api/ucp/a/b/c',
  ])('matches %s', (pathname) => {
    expect(isUcpPath(pathname)).toBe(true);
  });

  it.each([
    '/api/ucpfoo',
    '/api/auth/session',
    '/graphql',
    '/en/product/some-shoe',
    '/.well-known/ucp/extra',
    '/.well-known/other',
    '/',
  ])('does not match %s', (pathname) => {
    expect(isUcpPath(pathname)).toBe(false);
  });
});

describe('buildUpstreamUrl', () => {
  it('maps the well-known path onto the canonical domain', () => {
    expect(buildUpstreamUrl(new URL('https://storefront.example.com/.well-known/ucp')).href).toBe(
      `${VANITY_URL}/.well-known/ucp`,
    );
  });

  it('strips the trailing slash Next adds to api paths', () => {
    expect(
      buildUpstreamUrl(new URL('https://storefront.example.com/api/ucp/checkout_sessions/')).href,
    ).toBe(`${VANITY_URL}/api/ucp/checkout_sessions`);
  });

  it('preserves the query string', () => {
    expect(
      buildUpstreamUrl(new URL('https://storefront.example.com/api/ucp/products/?limit=5&page=2'))
        .href,
    ).toBe(`${VANITY_URL}/api/ucp/products?limit=5&page=2`);
  });

  it('preserves nested paths', () => {
    expect(buildUpstreamUrl(new URL('https://storefront.example.com/api/ucp/a/b/c')).href).toBe(
      `${VANITY_URL}/api/ucp/a/b/c`,
    );
  });
});

describe('buildUpstreamHeaders', () => {
  it.each([
    ['accept', 'application/json'],
    ['accept-language', 'en-AU'],
    ['authorization', 'Bearer agent-token'],
    ['content-digest', 'sha-256=:d2gR7A==:'],
    ['content-type', 'application/json'],
    ['idempotency-key', 'key-1'],
    ['if-match', '"v1"'],
    ['if-modified-since', 'Wed, 21 Oct 2026 07:28:00 GMT'],
    ['if-none-match', '"v1"'],
    ['if-unmodified-since', 'Wed, 21 Oct 2026 07:28:00 GMT'],
    ['origin', 'https://agent.example'],
    ['request-id', 'req-1'],
    ['signature', 'sig1=:dGVzdA==:'],
    ['signature-input', 'sig1=("@method" "@authority" "@path");created=1700000000'],
    ['ucp-agent', 'profile="https://agent.example/profile.json"'],
    ['user-agent', 'ShoppingAgent/1.0'],
    ['x-api-key', 'key-abc'],
    ['access-control-request-method', 'POST'],
  ])('forwards %s', (name, value) => {
    const headers = buildUpstreamHeaders(
      storefrontRequest('/api/ucp/checkout-sessions', { [name]: value }),
    );

    expect(headers.get(name)).toBe(value);
  });

  it('preserves the signature-input serialization byte for byte', () => {
    const signatureInput =
      'sig1=("@method" "@authority" "@path" "ucp-agent" "idempotency-key");created=1700000000;keyid="k1"';

    const headers = buildUpstreamHeaders(
      storefrontRequest('/api/ucp/checkout-sessions', { 'signature-input': signatureInput }),
    );

    expect(headers.get('signature-input')).toBe(signatureInput);
  });

  it('matches the allowlist case-insensitively', () => {
    const headers = buildUpstreamHeaders(
      storefrontRequest('/api/ucp/checkout-sessions', {
        'Idempotency-Key': 'key-1',
        'UCP-Agent': 'profile="https://agent.example/profile.json"',
      }),
    );

    expect(headers.get('idempotency-key')).toBe('key-1');
    expect(headers.get('ucp-agent')).toBe('profile="https://agent.example/profile.json"');
  });

  it('forwards unknown ucp- headers so later spec versions do not need a release', () => {
    const headers = buildUpstreamHeaders(
      storefrontRequest('/api/ucp/checkout-sessions', { 'ucp-something-new': 'value' }),
    );

    expect(headers.get('ucp-something-new')).toBe('value');
  });

  it.each(['ucpfoo', 'x-ucp-bar'])('does not treat %s as a ucp- prefixed header', (name) => {
    expect(
      buildUpstreamHeaders(
        storefrontRequest('/api/ucp/checkout-sessions', { [name]: 'value' }),
      ).has(name),
    ).toBe(false);
  });

  // Guards against the allowlist being widened back out. Each of these reaches a separate origin
  // over the public internet if forwarded.
  it.each([
    'accept-encoding',
    'cf-connecting-ip',
    'connection',
    'content-length',
    'cookie',
    'forwarded',
    'host',
    'next-action',
    'proxy-authorization',
    'referer',
    'rsc',
    'true-client-ip',
    'x-forwarded-for',
    'x-forwarded-host',
    'x-forwarded-proto',
    'x-middleware-preflight',
    'x-nextjs-data',
    'x-vercel-id',
    'x-whatever',
  ])('does not forward %s', (name) => {
    expect(
      buildUpstreamHeaders(
        storefrontRequest('/api/ucp/checkout-sessions', { [name]: 'value' }),
      ).has(name),
    ).toBe(false);
  });

  it('sets the loop guard marker and ignores any client-supplied value', () => {
    const headers = buildUpstreamHeaders(
      storefrontRequest('/.well-known/ucp', { [UCP_PROXY_MARKER]: 'evil' }),
    );

    expect(headers.get(UCP_PROXY_MARKER)).toBe('1');
  });
});

describe('buildDownstreamHeaders', () => {
  it.each([
    ['access-control-allow-origin', 'https://agent.example'],
    ['allow', 'GET, PUT'],
    ['cache-control', 'public, max-age=60'],
    ['content-digest', 'sha-256=:d2gR7A==:'],
    ['content-language', 'en-AU'],
    ['content-type', 'application/json'],
    ['etag', '"v1"'],
    ['last-modified', 'Wed, 21 Oct 2026 07:28:00 GMT'],
    ['location', 'https://example.mybigcommerce.com/api/ucp/checkout-sessions/1'],
    ['ratelimit-remaining', '9'],
    ['request-id', 'req-1'],
    ['retry-after', '60'],
    ['signature', 'sig1=:dGVzdA==:'],
    ['signature-input', 'sig1=("@status");created=1700000000'],
    ['ucp-something-new', 'value'],
    ['vary', 'Origin'],
    ['www-authenticate', 'Bearer realm="ucp"'],
    ['x-rate-limit-requests-left', '9'],
    ['x-ratelimit-remaining', '9'],
  ])('forwards %s', (name, value) => {
    expect(buildDownstreamHeaders(new Headers({ [name]: value })).get(name)).toBe(value);
  });

  it.each([
    'access-control-allow-credentials',
    'connection',
    'content-encoding',
    'content-length',
    'keep-alive',
    'server',
    'transfer-encoding',
    'x-bc-internal',
  ])('does not forward %s', (name) => {
    expect(buildDownstreamHeaders(new Headers({ [name]: 'value' })).has(name)).toBe(false);
  });

  it('drops every set-cookie value the upstream returns', () => {
    const upstreamHeaders = new Headers();

    upstreamHeaders.append('set-cookie', 'SHOP_SESSION_TOKEN=abc; Path=/; HttpOnly');
    upstreamHeaders.append('set-cookie', 'fornax_anonymousId=xyz; Path=/');

    expect(buildDownstreamHeaders(upstreamHeaders).getSetCookie()).toEqual([]);
  });
});
