/* eslint-disable @typescript-eslint/require-await */
import { LRUCache } from 'lru-cache';

import { KvAdapter } from '../types';

interface CacheEntry {
  value: unknown;
}

// How long the L1 copy of a value survives before `KV.mget` has to consult the
// shared store again. `KV.mget` skips the shared store whenever memory holds
// every requested key, so without an expiry that short-circuit is permanent:
// the only thing left driving refreshes is the `expiryTime` callers embed in
// the value, which refetches from the origin rather than re-reading the shared
// store. Expiring here is what lets a process pick up a value another process
// already fetched.
//
// 60s is Workers KV's floor for `cacheTtl` on a read; matching it keeps one
// staleness window rather than one per layer. It stays inside the shortest
// window callers embed in their own values — `with-routes` stores 5 minutes for
// storefront status, 30 minutes for routes.
//
// Only applied when there is a shared store to defer to. `createKVAdapter`
// falls back to this same adapter when no shared store is configured, and there
// expiring would be actively harmful: both layers would empty together, leaving
// the caller with no cached value at all and sending it down `with-routes`'
// blocking origin fetch every 60s instead of its intended 30-minute background
// refresh.
export const SHARED_STORE_RECHECK_MS = 60_000;

// Bounds memory under key churn. Cache keys include the query string, so
// distinct keys accumulate much faster than the number of real paths suggests.
const MAX_ENTRIES = 4096;

interface MemoryKvAdapterOptions {
  // Omit for an unbounded window: entries then leave only by LRU eviction.
  ttlMs?: number;
}

export class MemoryKvAdapter implements KvAdapter {
  private kv: LRUCache<string, CacheEntry>;

  constructor({ ttlMs }: MemoryKvAdapterOptions = {}) {
    this.kv = new LRUCache<string, CacheEntry>({
      max: MAX_ENTRIES,
      // `lru-cache` rejects a non-positive `ttl`, so the key is omitted rather
      // than passed as 0.
      ...(ttlMs === undefined ? {} : { ttl: ttlMs }),
      // Not `allowStale`. Serving an expired entry needs a background refresh to
      // replace it, and `KV.mget` has no `waitUntil` handle to run one on — so a
      // stale value would never be replaced. Expired reads fall through to the
      // shared store instead.
      //
      // `ttlResolution: 0` reads the clock on every lookup rather than debouncing
      // it behind a 1ms `setTimeout`, which avoids scheduling a timer per
      // operation on runtimes where timers are tied to the request lifetime.
      ttlResolution: 0,
    });
  }

  async mget<Data>(...keys: string[]) {
    // `LRUCache.get` returns undefined past the TTL, so expiry is the cache's
    // job rather than a hand-rolled `expiresAt` check.
    const entries = keys.map((key) => this.kv.get(key)?.value ?? null);

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return entries as Array<Data | null>;
  }

  async set<Data>(key: string, value: Data, options: { ex?: number } = {}) {
    // `ex` overrides the default window for this entry only.
    this.kv.set(key, { value }, options.ex ? { ttl: options.ex * 1_000 } : undefined);

    return value;
  }
}
