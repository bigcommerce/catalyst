import { defineCloudflareConfig, type OpenNextConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';
import queueCache from '@opennextjs/cloudflare/overrides/queue/queue-cache';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';

// OpenNext's `doQueue` routes ISR revalidation through a Durable Object that
// reads `env.WORKER_SELF_REFERENCE` and throws without it. That binding cannot
// point at this Worker on native hosting: a Cloudflare `service` binding
// resolves against account-level Workers, and a dispatch-namespace script is not
// addressable that way. Attempting it is rejected at upload with error 10143,
// "references Worker ... which was not found" — verified against a deployed
// store.
//
// A service binding *would* resolve if it pointed at an account-level Worker,
// and the dispatch router is one — binding it would route back here by hostname
// and keep the Durable Object queue intact. That was rejected deliberately: it
// would hand every tenant a handle able to reach any other tenant's Worker.
// Public fetches can already reach those endpoints, but only through the
// Cloudflare edge; an internal handle bypasses WAF and rate limiting, so it is
// not an equivalent capability.
//
// A binding is not actually required. The revalidation is a HEAD request to the
// page's own public URL carrying the build-time preview secret, which is exactly
// what the Durable Object issues once it holds the service handle. Sending it
// with a plain `fetch` leaves and re-enters through the dispatch router and
// arrives at the same Worker. `global_fetch_strictly_public` is set, so the
// subrequest is not short-circuited internally.
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
  queue: queueCache(selfFetchQueue, {
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
