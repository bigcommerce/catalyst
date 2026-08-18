import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryKvAdapter } from './memory';

describe('MemoryKvAdapter', () => {
  // `lru-cache` captures a reference to `performance` at module load. Vitest's
  // fake timers replace the global with a new object that reference never sees,
  // so the cache's clock has to be moved by stubbing the method in place.
  // `lru-cache` records an entry's start time as `perf.now()` and treats a
  // recorded start of exactly 0 as "no TTL set", so the clock must not start at
  // zero — expiry would be silently disabled and every assertion below would
  // pass regardless.
  const CLOCK_BASE_MS = 1_000_000;

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

  it('returns what was set', async () => {
    const adapter = new MemoryKvAdapter();

    await adapter.set('key', { hello: 'world' });

    expect(await adapter.mget('key')).toStrictEqual([{ hello: 'world' }]);
  });

  it('returns null for keys it has never seen', async () => {
    const adapter = new MemoryKvAdapter();

    expect(await adapter.mget('missing')).toStrictEqual([null]);
  });

  it('preserves key order across a mixed hit/miss batch', async () => {
    const adapter = new MemoryKvAdapter();

    await adapter.set('b', 'second');

    expect(await adapter.mget('a', 'b', 'c')).toStrictEqual([null, 'second', null]);
  });

  // `KV.mget` writes shared-store misses back into memory, so a cached null
  // must survive the round trip.
  it('stores a null value without losing the entry', async () => {
    const adapter = new MemoryKvAdapter();

    await adapter.set('key', null);

    expect(await adapter.mget('key')).toStrictEqual([null]);
  });

  // `KV.mget` skips the shared store while memory holds every requested key,
  // so expiry is what lets a process observe another process's writes.
  it('expires entries so reads fall through to the shared store', async () => {
    const adapter = new MemoryKvAdapter();

    await adapter.set('key', 'cached');

    advanceBy(59_000);
    expect(await adapter.mget('key')).toStrictEqual(['cached']);

    advanceBy(2_000);
    expect(await adapter.mget('key')).toStrictEqual([null]);
  });

  // Inside `with-routes`' shortest window (5 minutes for storefront status).
  it('expires well within the shortest caller freshness window', async () => {
    const adapter = new MemoryKvAdapter();

    await adapter.set('key', 'cached');

    advanceBy(1000 * 60 * 5);

    expect(await adapter.mget('key')).toStrictEqual([null]);
  });

  it('lets an explicit ex override the default window', async () => {
    const adapter = new MemoryKvAdapter();

    await adapter.set('key', 'cached', { ex: 300 });

    advanceBy(120_000);
    expect(await adapter.mget('key')).toStrictEqual(['cached']);

    advanceBy(181_000);
    expect(await adapter.mget('key')).toStrictEqual([null]);
  });

  it('refreshes the window when a key is written again', async () => {
    const adapter = new MemoryKvAdapter();

    await adapter.set('key', 'first');
    advanceBy(50_000);

    await adapter.set('key', 'second');
    advanceBy(50_000);

    expect(await adapter.mget('key')).toStrictEqual(['second']);
  });

  // Keys include the query string, so distinct keys accumulate quickly.
  it('evicts least-recently-used entries beyond its capacity', async () => {
    const adapter = new MemoryKvAdapter();

    await Promise.all(Array.from({ length: 4097 }, async (_, i) => adapter.set(`key-${i}`, i)));

    expect(await adapter.mget('key-0')).toStrictEqual([null]);
    expect(await adapter.mget('key-4096')).toStrictEqual([4096]);
  });

  it('holds well beyond the 500 entries it previously capped at', async () => {
    const adapter = new MemoryKvAdapter();

    await Promise.all(Array.from({ length: 2000 }, async (_, i) => adapter.set(`key-${i}`, i)));

    expect(await adapter.mget('key-0', 'key-1999')).toStrictEqual([0, 1999]);
  });
});
