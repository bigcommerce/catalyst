import {
  defineCloudflareConfig,
  getCloudflareContext,
  type OpenNextConfig,
} from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';
import queueCache from '@opennextjs/cloudflare/overrides/queue/queue-cache';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';

// OpenNext's `doQueue` cannot be used on native hosting: its Durable Object
// requires a `WORKER_SELF_REFERENCE` service binding, which a dispatch-namespace
// script cannot have. See LTRAC-1457 for why the alternatives were rejected.
//
// No binding is required. The revalidation is a HEAD request to the page's own
// public URL carrying the build-time preview secret, which is exactly what the
// Durable Object issues once it holds the service handle. Sending it with a
// plain `fetch` leaves and re-enters through the dispatch router and arrives at
// the same Worker. `global_fetch_strictly_public` is set, so the subrequest is
// not short-circuited internally.
//
// Wrapped in `queueCache` below so concurrent stale hits for one path collapse
// into a single revalidation. What is lost relative to the Durable Object is its
// retry and max-concurrency handling; a failed revalidation is retried on the
// next stale hit rather than by the queue itself.

// Matches the Durable Object's default. Without a bound, a hanging revalidation
// would sit in `waitUntil` holding the invocation alive.
const REVALIDATION_TIMEOUT_MS = 10_000;

const selfFetchQueue = {
  name: 'self-fetch-queue',
  async send({ MessageBody: { host, url } }: { MessageBody: { host: string; url: string } }) {
    const protocol = host.includes('localhost') ? 'http' : 'https';

    const response = await fetch(`${protocol}://${host}${url}`, {
      method: 'HEAD',
      headers: {
        // Inlined at build time; authorizes the revalidation. The name is
        // Next's, so the leading underscores are not ours to rename.
        // eslint-disable-next-line no-underscore-dangle
        'x-prerender-revalidate': process.env.__NEXT_PREVIEW_MODE_ID ?? '',
        'x-isr': '1',
      },
      signal: AbortSignal.timeout(REVALIDATION_TIMEOUT_MS),
    });

    // `fetch` resolves for 4xx/5xx, so a failed regeneration would otherwise be
    // indistinguishable from success. Throwing surfaces it: `queueCache` logs
    // the error and, with `waitForQueueAck`, skips caching the attempt — so the
    // next stale hit retries rather than the failure being swallowed. Silent
    // failure is the exact bug this queue exists to fix.
    if (!response.ok) {
      throw new Error(`Revalidation of ${url} failed with status ${response.status}`);
    }
  },
};

// A page render checks the same tags from many concurrent cache hits. OpenNext
// memoizes a tag only after its Durable Object read resolves, so concurrent
// checks each send their own read, and they queue on the same single-threaded
// shard. This makes concurrent reads of a tag within one request share one call.
type TagDataRecord = Record<string, unknown>;

interface TagCacheStub {
  getTagData(tags: string[]): Promise<TagDataRecord>;
  writeTags(tags: Array<{ tag: string }>): Promise<void>;
}

interface StubFactory {
  getDurableObjectStub(doId: { shardId: string }): TagCacheStub;
}

interface OpenNextRequestStore {
  requestCache: { getOrCreate<K, V>(key: string): Map<K, V> };
}

// The same per-request store OpenNext's tag cache uses for its own memo.
const getRequestCache = () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const als = Reflect.get(globalThis, '__openNextAls') as
    | { getStore(): OpenNextRequestStore | undefined }
    | undefined;

  return als?.getStore()?.requestCache;
};

const getRequestReads = () =>
  getRequestCache()?.getOrCreate<string, Promise<unknown>>('catalyst:tag-reads');

// When each tag read started, keyed like the reads above.
const getReadStarts = () =>
  getRequestCache()?.getOrCreate<string, number>('catalyst:tag-read-starts');

async function readTagsOnce(stub: TagCacheStub, shardId: string, tags: string[]) {
  const reads = getRequestReads();

  if (!reads) return stub.getTagData(tags);

  const keyOf = (tag: string) => `${shardId}|${tag}`;
  const missing = [...new Set(tags)].filter((tag) => !reads.has(keyOf(tag)));

  if (missing.length > 0) {
    const startedAt = Date.now();
    const batch = stub.getTagData(missing);
    const starts = getReadStarts();

    missing.forEach((tag) => {
      reads.set(
        keyOf(tag),
        batch.then((data) => data[tag]),
      );
      // Keep the earliest start, so a superseded read can't look fresh.
      if (!starts?.has(keyOf(tag))) starts?.set(keyOf(tag), startedAt);
    });
    // A failed read must not be reused for the rest of the request.
    batch.catch(() => missing.forEach((tag) => reads.delete(keyOf(tag))));
  }

  const values = await Promise.all(tags.map((tag) => reads.get(keyOf(tag))));

  return Object.fromEntries(
    tags.flatMap((tag, i) => (values[i] === undefined ? [] : [[tag, values[i]]])),
  );
}

function shareConcurrentTagReads<T>(tagCache: T): T {
  // `getDurableObjectStub` is private in OpenNext's types but public at runtime.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const factory = tagCache as unknown as StubFactory;
  const getStub = factory.getDurableObjectStub.bind(factory);

  factory.getDurableObjectStub = (doId) => {
    const stub = getStub(doId);

    return {
      getTagData: (tags) => readTagsOnce(stub, doId.shardId, tags),
      writeTags: (tags) => {
        // Later reads in this request must see the write.
        tags.forEach(({ tag }) => getRequestReads()?.delete(`${doId.shardId}|${tag}`));

        return stub.writeTags(tags);
      },
    };
  };

  return tagCache;
}

// Passed per request by the Storefront Hosting dispatch router: a stub that
// purges this project's tags, and the prefix they carry. Absent elsewhere.
interface DispatchCachePurge {
  stub: { purgeTags(tags: string[]): Promise<void> };
  prefix: string;
}

function getDispatchCachePurge(): DispatchCachePurge | undefined {
  let props: unknown;

  try {
    props = Reflect.get(getCloudflareContext().ctx, 'props');
  } catch {
    // No request context, e.g. at build time.
    return undefined;
  }

  if (typeof props !== 'object' || props === null) return undefined;

  const stub: unknown = Reflect.get(props, 'CATALYST_CACHE_PURGE');
  const prefix: unknown = Reflect.get(props, 'CATALYST_CACHE_TAG_PREFIX');

  if (!stub || typeof prefix !== 'string' || prefix === '') return undefined;

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return { stub: stub as DispatchCachePurge['stub'], prefix };
}

// TTL for regional tag entries the router can purge.
const PURGEABLE_TAG_TTL_SEC = 10 * 60;

// This request's in-flight tag writes. A purge waits for them, or another data
// center could cache the old state for the full TTL.
const getTagWrites = () =>
  getRequestCache()?.getOrCreate<string, Promise<unknown>>('catalyst:tag-writes');

function trackTagWrites(tags: unknown[], write: Promise<unknown>) {
  const writes = getTagWrites();

  if (!writes) return;

  const settled = write.catch(() => undefined);

  tags.forEach((input) => {
    const tag: unknown = typeof input === 'string' ? input : Reflect.get(Object(input), 'tag');

    if (typeof tag === 'string') writes.set(tag, settled);
  });
}

// The router's limit per call.
const MAX_TAGS_PER_PURGE = 100;

async function purgeTags(tags: string[]) {
  const purge = getDispatchCachePurge();

  // Without the stub, entries expire on the short TTL.
  if (!purge) return;

  const writes = getTagWrites();

  await Promise.all(tags.map((tag) => writes?.get(tag)));

  const batches = Array.from({ length: Math.ceil(tags.length / MAX_TAGS_PER_PURGE) }, (_, i) =>
    tags.slice(i * MAX_TAGS_PER_PURGE, (i + 1) * MAX_TAGS_PER_PURGE),
  );

  // A failed purge throws; OpenNext logs it as "Failed to revalidate tag".
  await Promise.all(batches.map((batch) => purge.stub.purgeTags(batch)));
}

const dispatchRouterCachePurge = {
  name: 'catalyst-dispatch-router',
  invalidateTags: purgeTags,
  // Only used for Pages Router `res.revalidate()`.
  invalidatePaths: (paths: Array<{ rawPath: string }>) =>
    purgeTags(paths.map((path) => `_N_T_${path.rawPath}`)),
};

// Only data read in the last 2s gets the long TTL. The router purges at least
// 5s after a write, so an older read could cache stale data past the purge.
const FRESH_READ_MS = 2_000;

function requestUrl(request: RequestInfo | URL): string {
  if (typeof request === 'string') return request;

  return request instanceof URL ? request.href : request.url;
}

// Tags the router can purge. A comma would split the tag in `cache-tag`.
const PURGEABLE_TAG = /^[\x21-\x2b\x2d-\x7e]+$/;
const MAX_CACHE_TAG_LENGTH = 1024;

// Keys look like `http://local.cache/shard/<shardId>?tag=<tag>`.
function canCacheLong(request: RequestInfo | URL, prefix: string): boolean {
  const match = /\/shard\/([^?]*)\?tag=(.*)$/.exec(requestUrl(request));

  if (!match) return false;

  const [, shardId = '', encodedTag = ''] = match;
  const tag = decodeURIComponent(encodedTag);

  if (!PURGEABLE_TAG.test(tag) || prefix.length + tag.length > MAX_CACHE_TAG_LENGTH) return false;

  const startedAt = getReadStarts()?.get(`${shardId}|${tag}`);

  return startedAt !== undefined && Date.now() - startedAt < FRESH_READ_MS;
}

function withPurgeableTags(
  request: RequestInfo | URL,
  response: Response,
  prefix: string,
): Response {
  const tags = response.headers.get('cache-tag');

  // An entry without tags can't be purged, so it keeps the short TTL.
  if (!tags) return response;

  const headers = new Headers(response.headers);

  headers.set(
    'cache-tag',
    tags
      .split(',')
      .map((tag) => `${prefix}${tag}`)
      .join(','),
  );

  if (canCacheLong(request, prefix)) {
    headers.set('cache-control', `max-age=${PURGEABLE_TAG_TTL_SEC}`);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// With the stub, the tag cache's regional entries go to a separate cache with
// prefixed tags and the long TTL; without it, to OpenNext's short-TTL cache.
// Relies on `getCacheInstance` and `writeTags`; if they change, nothing is
// wrapped.
function withPurgeableRegionalTags<T>(tagCache: T): T {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const internals = tagCache as unknown as {
    getCacheInstance(): Promise<Cache | undefined>;
    writeTags(tags: unknown[]): Promise<void>;
  };

  if (
    typeof internals.getCacheInstance !== 'function' ||
    typeof internals.writeTags !== 'function'
  ) {
    return tagCache;
  }

  const getCacheInstance = internals.getCacheInstance.bind(internals);
  const writeTags = internals.writeTags.bind(internals);

  internals.writeTags = (tags) => {
    const write = writeTags(tags);

    trackTagWrites(tags, write);

    return write;
  };

  let purgeableCache: Promise<Cache> | undefined;

  internals.getCacheInstance = async () => {
    const purge = getDispatchCachePurge();

    purgeableCache ??= caches.open('sharded-do-tag-cache-purgeable');

    const [ownCache, cache] = await Promise.all([getCacheInstance(), purgeableCache]);

    if (!ownCache) return undefined;

    // A tag write clears both caches.
    const deleteFromBoth = async (request: RequestInfo | URL) =>
      (await Promise.all([ownCache.delete(request), cache.delete(request)])).some(Boolean);

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return (purge
      ? {
          match: cache.match.bind(cache),
          delete: deleteFromBoth,
          put: (request: RequestInfo | URL, response: Response) =>
            cache.put(request, withPurgeableTags(request, response, purge.prefix)),
        }
      : {
          match: ownCache.match.bind(ownCache),
          delete: deleteFromBoth,
          put: ownCache.put.bind(ownCache),
        }) as unknown as Cache;
  };

  return tagCache;
}

const cloudflareConfig = defineCloudflareConfig({
  // Purges the tag cache's regional entries; see `withPurgeableRegionalTags`.
  cachePurge: dispatchRouterCachePurge,
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: 'long-lived',
    // Hits must still check tags: nothing purges this cache. Next 15 turns the
    // check off once `cachePurge` is set, so set both options explicitly.
    bypassTagCacheOnCacheHit: false,
    shouldLazilyUpdateOnCacheHit: true,
  }),
  queue: queueCache(selfFetchQueue, {
    regionalCacheTtlSec: 5,
    waitForQueueAck: true,
  }),
  routePreloadingBehavior: 'withWaitUntil',
  tagCache: withPurgeableRegionalTags(
    shareConcurrentTagReads(
      doShardedTagCache({
        // Few shards on purpose: an idle Durable Object takes 0.5-1s to answer,
        // and spreading a store's tag reads over more objects leaves each one
        // idle more often.
        baseShardSize: 4,
        regionalCache: true,
        // TTL for regional tag entries without the purge stub, e.g. in local
        // preview. `revalidateTag` only clears them in the calling data center.
        regionalCacheTtlSec: 30,
        regionalCacheDangerouslyPersistMissingTags: true,
        shardReplication: {
          numberOfSoftReplicas: 1,
          numberOfHardReplicas: 1,
          regionalReplication: {
            defaultRegion: 'enam',
          },
        },
      }),
    ),
  ),
  enableCacheInterception: false,
});

const config: OpenNextConfig = {
  // Invoke Next through `node` on its published bin rather than the
  // `node_modules/.bin/next` shim. OpenNext runs this string via
  // `execSync`, which shells out to cmd.exe on native Windows — where the
  // extensionless POSIX shim and forward-slash path both fail to resolve.
  // Calling `node <bin>` works identically across sh and cmd.exe (node.exe
  // accepts forward slashes) while still bypassing the project's `build`
  // script so the `generate` step is skipped.
  buildCommand: 'node ./node_modules/next/dist/bin/next build',
  ...cloudflareConfig,
};

export default config;
