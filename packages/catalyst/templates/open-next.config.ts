import { defineCloudflareConfig, type OpenNextConfig } from '@opennextjs/cloudflare';
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
const getRequestReads = () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const als = Reflect.get(globalThis, '__openNextAls') as
    | { getStore(): OpenNextRequestStore | undefined }
    | undefined;

  return als?.getStore()?.requestCache.getOrCreate<string, Promise<unknown>>('catalyst:tag-reads');
};

async function readTagsOnce(stub: TagCacheStub, shardId: string, tags: string[]) {
  const reads = getRequestReads();

  if (!reads) return stub.getTagData(tags);

  const keyOf = (tag: string) => `${shardId}|${tag}`;
  const missing = [...new Set(tags)].filter((tag) => !reads.has(keyOf(tag)));

  if (missing.length > 0) {
    const batch = stub.getTagData(missing);

    missing.forEach((tag) => {
      reads.set(
        keyOf(tag),
        batch.then((data) => data[tag]),
      );
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

const cloudflareConfig = defineCloudflareConfig({
  // The absence of `cachePurge` and `bypassTagCacheOnCacheHit` is deliberate.
  // Invalidating regional (Cache API) entries needs either a CDN purge that
  // evicts them or a tag-cache check on every hit; this takes the second.
  //
  // Do not restore `cachePurge` without reading LTRAC-1458 first. OpenNext's
  // `isPurgeCacheEnabled()` checks only whether it is *declared*, never whether
  // it can authenticate, and declaring it turns off both
  // `shouldLazilyUpdateOnCacheHit` and the tag check. A purge that cannot
  // authenticate therefore leaves entries neither purged, nor refreshed from R2,
  // nor tag-checked, and `revalidateTag` silently stops working.
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: 'long-lived',
  }),
  queue: queueCache(selfFetchQueue, {
    regionalCacheTtlSec: 5,
    waitForQueueAck: true,
  }),
  routePreloadingBehavior: 'withWaitUntil',
  tagCache: shareConcurrentTagReads(
    doShardedTagCache({
      // Few shards on purpose: an idle Durable Object takes 0.5-1s to answer,
      // and spreading a store's tag reads over more objects leaves each one
      // idle more often.
      baseShardSize: 4,
      regionalCache: true,
      // Every cache hit checks its tags, so once this expires the next hit goes
      // to the Durable Object shards. At 5s, nearly every request on a
      // low-traffic store paid that round trip, adding about 1s. `revalidateTag`
      // clears this entry in the data center that calls it, so only other data
      // centers can see a revalidated tag up to this many seconds late.
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
