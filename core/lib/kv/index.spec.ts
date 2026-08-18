import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { kv } from './index';

// `lru-cache` captures a reference to `performance` at module load, so the
// clock has to be moved by stubbing the method in place rather than with fake
// timers. A recorded start time of exactly 0 reads as "no TTL", hence the
// non-zero baseline.
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
