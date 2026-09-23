import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildDownstreamHeaders,
  buildUpstreamHeaders,
  buildUpstreamUrl,
  isUcpPath,
  UCP_PROXY_MARKER,
} from './upstream';

const STORE_HASH = 'abc123';
const CHANNEL_ID = '1';
const CANONICAL_URL = `https://store-${STORE_HASH}-${CHANNEL_ID}.mybigcommerce.com`;
const VANITY_URL = 'https://storefront.example.com';

vi.mock('~/channels.config', () => ({
  getChannelIdFromLocale: () => process.env.BIGCOMMERCE_CHANNEL_ID,
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
  beforeEach(() => {
    vi.stubEnv('BIGCOMMERCE_STORE_HASH', STORE_HASH);
    vi.stubEnv('BIGCOMMERCE_CHANNEL_ID', CHANNEL_ID);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('maps the well-known path onto the canonical domain', () => {
    expect(buildUpstreamUrl(new URL('https://storefront.example.com/.well-known/ucp'))?.href).toBe(
      `${CANONICAL_URL}/.well-known/ucp`,
    );
  });

  it('does not target the storefront it was called on', () => {
    const upstreamUrl = buildUpstreamUrl(new URL(`${VANITY_URL}/.well-known/ucp`));

    expect(upstreamUrl?.host).not.toBe(new URL(VANITY_URL).host);
  });

  it.each(['/api/ucp/checkout_sessions', '/.well-known/ucp'])(
    'forwards %o verbatim, since signatures cover the path',
    (pathname) => {
      expect(buildUpstreamUrl(new URL(`https://storefront.example.com${pathname}`))?.href).toBe(
        `${CANONICAL_URL}${pathname}`,
      );
    },
  );

  it.each([
    ['/api/ucp/checkout_sessions/', '/api/ucp/checkout_sessions'],
    ['/api/ucp/checkout_sessions//', '/api/ucp/checkout_sessions'],
    ['/.well-known/ucp/', '/.well-known/ucp'],
    ['/', '/'],
  ])('strips the trailing slash from %o', (pathname, expected) => {
    expect(buildUpstreamUrl(new URL(`https://storefront.example.com${pathname}`))?.href).toBe(
      `${CANONICAL_URL}${expected}`,
    );
  });

  it('preserves the query string', () => {
    expect(
      buildUpstreamUrl(new URL('https://storefront.example.com/api/ucp/products/?limit=5&page=2'))
        ?.href,
    ).toBe(`${CANONICAL_URL}/api/ucp/products?limit=5&page=2`);
  });

  it('preserves nested paths', () => {
    expect(buildUpstreamUrl(new URL('https://storefront.example.com/api/ucp/a/b/c'))?.href).toBe(
      `${CANONICAL_URL}/api/ucp/a/b/c`,
    );
  });

  it('honours the canonical domain override', () => {
    vi.stubEnv('BIGCOMMERCE_GRAPHQL_API_DOMAIN', 'store.bcdev');

    expect(buildUpstreamUrl(new URL('https://storefront.example.com/.well-known/ucp'))?.href).toBe(
      `https://store-${STORE_HASH}-${CHANNEL_ID}.store.bcdev/.well-known/ucp`,
    );
  });

  it.each(['BIGCOMMERCE_STORE_HASH', 'BIGCOMMERCE_CHANNEL_ID'])(
    'returns null when %s is unset',
    (name) => {
      vi.stubEnv(name, '');

      expect(
        buildUpstreamUrl(new URL('https://storefront.example.com/.well-known/ucp')),
      ).toBeNull();
    },
  );
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
    ['signature-agent', 'sig1="https://agent.example/.well-known/ucp";type=jwks_uri'],
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

  it.each([
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

  it.each([
    ['gzip, deflate, br', 'a client asking for compression'],
    ['identity', 'a client already asking for identity'],
  ])('forces identity encoding over %o', (value) => {
    const headers = buildUpstreamHeaders(
      storefrontRequest('/api/ucp/checkout-sessions', { 'accept-encoding': value }),
    );

    expect(headers.get('accept-encoding')).toBe('identity');
  });

  it('forces identity encoding when the client sends no accept-encoding', () => {
    expect(
      buildUpstreamHeaders(storefrontRequest('/api/ucp/checkout-sessions')).get('accept-encoding'),
    ).toBe('identity');
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
    ['location', 'https://store-abc123-1.mybigcommerce.com/api/ucp/checkout-sessions/1'],
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
