import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CloudflareKvAdapter,
  getRoutesKvNamespace,
  isRoutesKvNamespace,
  type RoutesKvNamespace,
} from './cloudflare-kv';

const CLOUDFLARE_CONTEXT_SYMBOL = Symbol.for('__cloudflare-context__');

// The adapter logs by default outside production. Silence it for the bulk of
// the suite; the logging tests below opt back in.
process.env.KV_LOGGER = 'false';

/**
 * Stands in for a Workers KV namespace. Deliberately stores raw strings and
 * parses on `get(key, 'json')`, exactly as Workers KV does, so a round-trip
 * that mismatched `JSON.stringify` / `'json'` would fail here.
 */
class FakeKvNamespace implements RoutesKvNamespace {
  readonly store = new Map<string, string>();

  lastPutOptions: { expirationTtl?: number } | undefined;

  // eslint-disable-next-line @typescript-eslint/require-await
  async get(key: string, type: 'json'): Promise<unknown> {
    expect(type).toBe('json');

    const raw = this.store.get(key);

    if (raw === undefined) {
      return null;
    }

    return JSON.parse(raw);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> {
    expect(typeof value).toBe('string');

    this.lastPutOptions = options;
    this.store.set(key, value);
  }
}

function setCloudflareContext(context: unknown) {
  Reflect.set(globalThis, CLOUDFLARE_CONTEXT_SYMBOL, context);
}

function clearCloudflareContext() {
  Reflect.deleteProperty(globalThis, CLOUDFLARE_CONTEXT_SYMBOL);
}

afterEach(() => {
  clearCloudflareContext();
  vi.restoreAllMocks();
});

describe('isRoutesKvNamespace', () => {
  it('accepts a value exposing get and put', () => {
    expect(isRoutesKvNamespace(new FakeKvNamespace())).toBe(true);
  });

  // Annotated so the heterogeneous rows infer as [string, unknown] rather
  // than tripping circular inference on the inline method shorthands.
  const rejected: Array<[string, unknown]> = [
    ['a string (the merchant env-var collision case)', 'some-namespace-id'],
    ['null', null],
    ['undefined', undefined],
    ['a number', 42],
    ['an object missing put', { get: () => null }],
    ['an object missing get', { put: () => undefined }],
    ['an object whose get is not callable', { get: 'nope', put: () => undefined }],
  ];

  it.each(rejected)('rejects %s', (_label, value) => {
    expect(isRoutesKvNamespace(value)).toBe(false);
  });
});

describe('getRoutesKvNamespace', () => {
  it('returns the binding when the Cloudflare context exposes a well-shaped namespace', () => {
    const namespace = new FakeKvNamespace();

    setCloudflareContext({ env: { CATALYST_ROUTES_KV: namespace } });

    expect(getRoutesKvNamespace()).toBe(namespace);
  });

  it('returns null when there is no Cloudflare context at all', () => {
    // The non-Cloudflare runtime case: plain Vercel, self-hosted, `next build`.
    expect(getRoutesKvNamespace()).toBeNull();
  });

  it('returns null when the context has no env', () => {
    setCloudflareContext({});

    expect(getRoutesKvNamespace()).toBeNull();
  });

  it('returns null when the binding was not provisioned', () => {
    setCloudflareContext({ env: {} });

    expect(getRoutesKvNamespace()).toBeNull();
  });

  it('returns null when the binding is a plain string', () => {
    // A merchant-defined env var literally named CATALYST_ROUTES_KV arrives as
    // a string. A bare presence check would accept it and then throw on the
    // first `.get()`.
    setCloudflareContext({ env: { CATALYST_ROUTES_KV: 'not-a-namespace' } });

    expect(getRoutesKvNamespace()).toBeNull();
  });

  it('does not throw when the context global holds an unexpected primitive', () => {
    setCloudflareContext('garbage');

    expect(() => getRoutesKvNamespace()).not.toThrow();
    expect(getRoutesKvNamespace()).toBeNull();
  });
});

describe('CloudflareKvAdapter', () => {
  let namespace: FakeKvNamespace;
  let adapter: CloudflareKvAdapter;

  beforeEach(() => {
    namespace = new FakeKvNamespace();
    adapter = new CloudflareKvAdapter(namespace);
  });

  it('round-trips a value through set and mget', async () => {
    const value = { redirect: '/new-path', status: 301 };

    await adapter.set('routes_key', value);

    expect(namespace.store.get('routes_key')).toBe(JSON.stringify(value));
    await expect(adapter.mget<typeof value>('routes_key')).resolves.toEqual([value]);
  });

  it('returns the value it was given from set', async () => {
    await expect(adapter.set('key', { a: 1 })).resolves.toEqual({ a: 1 });
  });

  it('returns null for keys that are not present', async () => {
    await expect(adapter.mget('missing')).resolves.toEqual([null]);
  });

  it('reads multiple keys in one call, preserving order', async () => {
    await adapter.set('a', 'first');
    await adapter.set('c', 'third');

    await expect(adapter.mget<string>('a', 'b', 'c')).resolves.toEqual(['first', null, 'third']);
  });

  it('issues one get per key, since Workers KV has no multi-get', async () => {
    const getSpy = vi.spyOn(namespace, 'get');

    await adapter.mget('a', 'b', 'c');

    expect(getSpy).toHaveBeenCalledTimes(3);
  });

  it('returns an empty array when called with no keys', async () => {
    await expect(adapter.mget()).resolves.toEqual([]);
  });

  it('round-trips falsy values without confusing them for a miss', async () => {
    await adapter.set('zero', 0);
    await adapter.set('empty', '');
    await adapter.set('false', false);

    await expect(adapter.mget('zero', 'empty', 'false')).resolves.toEqual([0, '', false]);
  });

  it('degrades a failing get to null instead of rejecting the whole batch', async () => {
    await adapter.set('ok', 'value');
    vi.spyOn(namespace, 'get').mockImplementation((key: string) => {
      if (key === 'boom') {
        return Promise.reject(new Error('KV unreachable'));
      }

      return Promise.resolve('value');
    });

    await expect(adapter.mget<string>('ok', 'boom')).resolves.toEqual(['value', null]);
  });

  it('swallows a failing put so a cache write cannot break the request', async () => {
    vi.spyOn(namespace, 'put').mockRejectedValue(new Error('KV unreachable'));

    await expect(adapter.set('key', 'value')).resolves.toBe('value');
  });

  // Without an expiration, Workers KV keeps entries forever and nothing else
  // deletes them — see the TTL rationale in the adapter.
  it('writes with an expiration so entries cannot accumulate forever', async () => {
    await adapter.set('key', 'value');

    expect(namespace.lastPutOptions?.expirationTtl).toBeGreaterThan(0);
  });

  // The TTL garbage-collects; `expiryTime` inside the value drives
  // revalidation. If the TTL ever dropped to the freshness window, entries
  // would vanish exactly as they went stale and every stale-while-revalidate
  // hit would become a blocking GraphQL fetch.
  it('expires far later than the longest freshness window in with-routes', async () => {
    const thirtyMinutes = 60 * 30;

    await adapter.set('key', 'value');

    expect(namespace.lastPutOptions?.expirationTtl).toBeGreaterThan(thirtyMinutes);
  });
});

describe('CloudflareKvAdapter logging', () => {
  const originalKvLogger = process.env.KV_LOGGER;

  afterEach(() => {
    if (originalKvLogger === undefined) {
      delete process.env.KV_LOGGER;
    } else {
      process.env.KV_LOGGER = originalKvLogger;
    }
  });

  it('logs when KV_LOGGER is enabled', async () => {
    process.env.KV_LOGGER = 'true';

    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await new CloudflareKvAdapter(new FakeKvNamespace()).set('key', 'value');

    expect(log).toHaveBeenCalledWith(expect.stringContaining('[BigCommerce] Cloudflare KV'));
  });

  it('stays quiet when KV_LOGGER is explicitly disabled', async () => {
    process.env.KV_LOGGER = 'false';

    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const adapter = new CloudflareKvAdapter(new FakeKvNamespace());

    await adapter.set('key', 'value');
    await adapter.mget('key');

    expect(log).not.toHaveBeenCalled();
  });
});
