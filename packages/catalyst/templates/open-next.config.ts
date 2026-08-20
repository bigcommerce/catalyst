import { defineCloudflareConfig, type OpenNextConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';
import queueCache from '@opennextjs/cloudflare/overrides/queue/queue-cache';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';

const cloudflareConfig = defineCloudflareConfig({
  // No `bypassTagCacheOnCacheHit` and no `cachePurge`. Correct invalidation of
  // regional (Cache API) entries needs one of two mechanisms: a CDN purge that
  // evicts them, or a tag-cache check on every hit. They are alternatives, and
  // Catalyst was configured for the first while having neither.
  //
  // Purge cannot be enabled safely here. It needs a Cloudflare API token bound
  // into the Worker, and a Worker binding is readable by the merchant's own
  // application code. Cloudflare purge is zone-scoped and native hosting puts
  // every tenant on one shared zone, so a token extracted from any tenant could
  // purge every other tenant's cache.
  //
  // Declaring `cachePurge` anyway was worse than not having it: OpenNext's
  // `isPurgeCacheEnabled()` only checks whether it is *declared*, so it believed
  // purge was handling invalidation and disabled `shouldLazilyUpdateOnCacheHit`
  // (on by default for 'long-lived'), while `bypassTagCacheOnCacheHit` skipped
  // the tag check. A hit was then neither purged, nor refreshed from R2, nor
  // tag-checked, so `revalidateTag` had no effect on it until max-age expired.
  //
  // Omitting both takes the tag-checking route: the tag cache is consulted on a
  // hit and the entry refreshes from R2 in the background. Costs an extra read
  // per hit. Purge is still the faster option — restore it only together with a
  // design that keeps the credential out of tenant Workers.
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: 'long-lived',
  }),
  queue: queueCache(doQueue, {
    regionalCacheTtlSec: 5,
    waitForQueueAck: true,
  }),
  routePreloadingBehavior: 'withWaitUntil',
  tagCache: doShardedTagCache({
    baseShardSize: 12,
    regionalCache: true,
    regionalCacheTtlSec: 5,
    regionalCacheDangerouslyPersistMissingTags: true,
    shardReplication: {
      numberOfSoftReplicas: 4,
      numberOfHardReplicas: 2,
      regionalReplication: {
        defaultRegion: 'enam',
      },
    },
  }),
  enableCacheInterception: false,
});

const config: OpenNextConfig = {
  buildCommand: 'node_modules/.bin/next build',
  ...cloudflareConfig,
};

export default config;
