import { defineCloudflareConfig, type OpenNextConfig } from '@opennextjs/cloudflare';
import { purgeCache } from '@opennextjs/cloudflare/overrides/cache-purge/index';
import kvIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';
import queueCache from '@opennextjs/cloudflare/overrides/queue/queue-cache';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';

const cloudflareConfig = defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  queue: queueCache(doQueue, {
    regionalCacheTtlSec: 5,
  }),
  routePreloadingBehavior: 'withWaitUntil',
  tagCache: doShardedTagCache({
    baseShardSize: 12,
    regionalCache: true,
    regionalCacheTtlSec: 5,
    shardReplication: {
      numberOfSoftReplicas: 4,
      numberOfHardReplicas: 2,
      regionalReplication: {
        defaultRegion: 'enam',
      },
    },
  }),
  enableCacheInterception: false,
  cachePurge: purgeCache({ type: 'durableObject' }),
});

const config: OpenNextConfig = {
  buildCommand: 'pnpm run generate && pnpm exec next build --no-lint',
  ...cloudflareConfig,
};

export default config;
