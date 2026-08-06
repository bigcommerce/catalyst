import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CloudflareKvAdapter } from './adapters/cloudflare-kv';
import { MemoryKvAdapter } from './adapters/memory';
import { UpstashKvAdapter } from './adapters/upstash';
import { RuntimeCacheAdapter } from './adapters/vercel-runtime-cache';

import { createKVAdapter, kv } from './index';

// Both of these construct a client eagerly in a field initializer, which
// throws outside their respective platforms. Stub the SDKs rather than the
// adapter modules so the real selection logic in `createKVAdapter` runs.
vi.mock('@vercel/functions', () => ({
  getCache: () => ({ get: vi.fn(), set: vi.fn() }),
}));

vi.mock('@upstash/redis', () => ({
  Redis: { fromEnv: () => ({ mget: vi.fn(), set: vi.fn() }) },
}));

const CLOUDFLARE_CONTEXT_SYMBOL = Symbol.for('__cloudflare-context__');

const fakeNamespace = () => ({
  get: vi.fn().mockResolvedValue(null),
  put: vi.fn().mockResolvedValue(undefined),
});

function bindRoutesKv(value: unknown) {
  Reflect.set(globalThis, CLOUDFLARE_CONTEXT_SYMBOL, { env: { CATALYST_ROUTES_KV: value } });
}

const UPSTASH_ENV = {
  UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
  UPSTASH_REDIS_REST_TOKEN: 'token',
};

beforeEach(() => {
  // Vitest inherits the ambient environment; a developer with these exported
  // locally would otherwise silently change which branch is under test.
  vi.stubEnv('VERCEL', undefined);
  vi.stubEnv('UPSTASH_REDIS_REST_URL', undefined);
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', undefined);
});

afterEach(() => {
  Reflect.deleteProperty(globalThis, CLOUDFLARE_CONTEXT_SYMBOL);
  vi.unstubAllEnvs();
});

describe('createKVAdapter', () => {
  it('picks the Cloudflare adapter when a well-shaped routes KV binding is present', async () => {
    bindRoutesKv(fakeNamespace());

    await expect(createKVAdapter()).resolves.toBeInstanceOf(CloudflareKvAdapter);
  });

  it('prefers Vercel Runtime Cache over Cloudflare KV when both look available', async () => {
    vi.stubEnv('VERCEL', '1');
    bindRoutesKv(fakeNamespace());

    await expect(createKVAdapter()).resolves.toBeInstanceOf(RuntimeCacheAdapter);
  });

  it('prefers Cloudflare KV over Upstash when both are configured', async () => {
    bindRoutesKv(fakeNamespace());
    vi.stubEnv('UPSTASH_REDIS_REST_URL', UPSTASH_ENV.UPSTASH_REDIS_REST_URL);
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', UPSTASH_ENV.UPSTASH_REDIS_REST_TOKEN);

    await expect(createKVAdapter()).resolves.toBeInstanceOf(CloudflareKvAdapter);
  });

  describe('falls through without throwing', () => {
    it('to Memory when there is no Cloudflare context (non-Cloudflare runtime)', async () => {
      await expect(createKVAdapter()).resolves.toBeInstanceOf(MemoryKvAdapter);
    });

    it('to Memory when the binding is absent from an existing Cloudflare context', async () => {
      Reflect.set(globalThis, CLOUDFLARE_CONTEXT_SYMBOL, { env: {} });

      await expect(createKVAdapter()).resolves.toBeInstanceOf(MemoryKvAdapter);
    });

    it('to Memory when the binding is a string (merchant env-var collision)', async () => {
      bindRoutesKv('a-merchant-supplied-value');

      await expect(createKVAdapter()).resolves.toBeInstanceOf(MemoryKvAdapter);
    });

    it('to Upstash when Upstash is configured and no routes KV binding exists', async () => {
      vi.stubEnv('UPSTASH_REDIS_REST_URL', UPSTASH_ENV.UPSTASH_REDIS_REST_URL);
      vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', UPSTASH_ENV.UPSTASH_REDIS_REST_TOKEN);

      await expect(createKVAdapter()).resolves.toBeInstanceOf(UpstashKvAdapter);
    });

    it('to Upstash when the binding is a string and Upstash is configured', async () => {
      bindRoutesKv('a-merchant-supplied-value');
      vi.stubEnv('UPSTASH_REDIS_REST_URL', UPSTASH_ENV.UPSTASH_REDIS_REST_URL);
      vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', UPSTASH_ENV.UPSTASH_REDIS_REST_TOKEN);

      await expect(createKVAdapter()).resolves.toBeInstanceOf(UpstashKvAdapter);
    });

    it('to Memory when only one half of the Upstash credentials is set', async () => {
      vi.stubEnv('UPSTASH_REDIS_REST_URL', UPSTASH_ENV.UPSTASH_REDIS_REST_URL);

      await expect(createKVAdapter()).resolves.toBeInstanceOf(MemoryKvAdapter);
    });
  });
});

const CLOCK_BASE_MS = 1_000_000;
const SIXTY_ONE_SECONDS = 61_000;

describe('kv', () => {
  let now = CLOCK_BASE_MS;

  const advanceBy = (ms: number) => {
    now += ms;
  };

  beforeEach(() => {
    now = CLOCK_BASE_MS;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // With no shared store configured, `createKVAdapter` falls back to an
  // in-process adapter. If both it and the L1 in front of it expired, a value
  // would vanish entirely once the window passed — and `with-routes` treats a
  // missing entry as a blocking origin fetch rather than a background refresh.
  it('keeps values past the L1 window when no shared store is configured', async () => {
    await kv.set('no-shared-store', { value: 'cached' });

    advanceBy(SIXTY_ONE_SECONDS);

    expect(await kv.get('no-shared-store')).toStrictEqual({ value: 'cached' });
  });

  it('reads back a value it just wrote', async () => {
    await kv.set('immediate', { value: 'cached' });

    expect(await kv.get('immediate')).toStrictEqual({ value: 'cached' });
  });

  it('returns null for a key it has never seen', async () => {
    expect(await kv.get('never-written')).toBeNull();
  });

  it('resolves several keys in the order requested', async () => {
    await kv.set('first', 1);
    await kv.set('second', 2);

    expect(await kv.mget('first', 'second')).toStrictEqual([1, 2]);
  });
});
