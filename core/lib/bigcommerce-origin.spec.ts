import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildChannelOrigin, canonicalDomain } from './bigcommerce-origin';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('canonicalDomain', () => {
  it('defaults to the production domain', () => {
    expect(canonicalDomain()).toBe('mybigcommerce.com');
  });

  it('honours the environment override', () => {
    vi.stubEnv('BIGCOMMERCE_GRAPHQL_API_DOMAIN', 'store.bcdev');

    expect(canonicalDomain()).toBe('store.bcdev');
  });
});

describe('buildChannelOrigin', () => {
  it('puts the store hash and channel in the hostname', () => {
    expect(buildChannelOrigin('abc123', '1')).toBe('https://store-abc123-1.mybigcommerce.com');
  });

  it('follows the environment override', () => {
    vi.stubEnv('BIGCOMMERCE_GRAPHQL_API_DOMAIN', 'store.bcdev');

    expect(buildChannelOrigin('abc123', '1')).toBe('https://store-abc123-1.store.bcdev');
  });

  it('accepts an explicit domain', () => {
    vi.stubEnv('BIGCOMMERCE_GRAPHQL_API_DOMAIN', 'ignored.example');

    expect(buildChannelOrigin('abc123', '1', 'store.bcdev')).toBe(
      'https://store-abc123-1.store.bcdev',
    );
  });

  it('produces a parseable origin', () => {
    const origin = buildChannelOrigin('abc123', '1');

    expect(new URL('/.well-known/ucp', origin).href).toBe(`${origin}/.well-known/ucp`);
  });
});
