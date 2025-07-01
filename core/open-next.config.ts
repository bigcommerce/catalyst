import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import { purgeCache } from '@opennextjs/cloudflare/overrides/cache-purge/index';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';

export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, { mode: 'long-lived' }),
  queue: doQueue,
  // This is only required if you use On-demand revalidation
  tagCache: doShardedTagCache({
    baseShardSize: 12,
    regionalCache: true, // Enable regional cache to reduce the load on the DOs
    regionalCacheTtlSec: 5, // The TTL for the regional cache
    shardReplication: {
      numberOfSoftReplicas: 4,
      numberOfHardReplicas: 2,
      regionalReplication: {
        defaultRegion: 'enam',
      },
    },
  }),
  // Disable this if you want to use PPR
  enableCacheInterception: false,
  // you can also use the `durableObject` option to use a durable object as a cache purge
  cachePurge: purgeCache({ type: 'direct' }),
});
