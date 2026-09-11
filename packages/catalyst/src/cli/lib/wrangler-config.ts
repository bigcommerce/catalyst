// The compatibility date, compatibility flags, Durable Object classes,
// migration tag, and KV namespace binding below are mirrored in Ignition,
// which builds its own Worker metadata at deploy time
// (pkg/cloudflare/upload/metadata.go and
// pkg/cloudflare/upload/migrations/migrations.go). Keep both sides in sync
// when changing any of them.
//
// Note that only the CATALYST_ROUTES_KV *binding name* is shared with
// Ignition — the namespace id here is a local-only placeholder (see below),
// while Ignition binds the real per-project namespace it provisioned.
export function getCompatibilityDate(now = new Date()): string {
  const date = new Date(now);

  // One month behind the current date: recent enough to track Cloudflare
  // runtime behavior (per Cloudflare guidance), buffered enough to avoid
  // brand-new compatibility-date-gated changes. Ignition applies the same
  // offset at deploy time, so the bundle is never built against newer
  // semantics than it runs under.
  date.setUTCMonth(date.getUTCMonth() - 1);

  return date.toISOString().slice(0, 10);
}

// Namespace id for the routing cache KV binding in the *generated* config,
// which only ever drives local `wrangler dev`/`opennextjs-cloudflare preview`
// (where Miniflare keys its simulated store under `.wrangler/state/v3/kv`)
// and the `wrangler deploy --dry-run` bundling step, which never resolves
// bindings against the Cloudflare API. Ignition overwrites this with the real
// per-project namespace id when it uploads the Worker.
//
// The value is deliberately not a 32-char lowercase hex string — the only
// shape a real provisioned Cloudflare namespace id can take — so it cannot
// collide with a production store's cache even if this config were somehow
// used against the live API. Such a request fails closed with an invalid-id
// error instead of reading or writing someone's real routing cache.
const LOCAL_ROUTES_KV_NAMESPACE_ID = 'catalyst-routes-kv-local';

export function getWranglerConfig(projectUuid: string) {
  return {
    $schema: 'node_modules/wrangler/config-schema.json',
    main: '../.open-next/worker.js',
    name: `project-${projectUuid}`,
    compatibility_date: getCompatibilityDate(),
    compatibility_flags: ['nodejs_compat', 'global_fetch_strictly_public'],
    observability: {
      enabled: true,
      head_sampling_rate: 0.05,
      logs: {
        enabled: true,
        head_sampling_rate: 1,
        invocation_logs: false,
      },
    },
    assets: {
      directory: '../.open-next/assets',
      binding: 'ASSETS',
    },
    services: [
      {
        binding: 'WORKER_SELF_REFERENCE',
        service: `project-${projectUuid}`,
      },
    ],
    r2_buckets: [
      {
        binding: 'NEXT_INC_CACHE_R2_BUCKET',
        bucket_name: `project-${projectUuid}`,
      },
    ],
    kv_namespaces: [
      {
        binding: 'CATALYST_ROUTES_KV',
        id: LOCAL_ROUTES_KV_NAMESPACE_ID,
      },
    ],
    durable_objects: {
      bindings: [
        {
          name: 'NEXT_CACHE_DO_QUEUE',
          class_name: 'DOQueueHandler',
        },
        {
          name: 'NEXT_TAG_CACHE_DO_SHARDED',
          class_name: 'DOShardedTagCache',
        },
        {
          name: 'NEXT_CACHE_DO_PURGE',
          class_name: 'BucketCachePurge',
        },
      ],
    },
    migrations: [
      {
        tag: 'v1',
        new_sqlite_classes: ['DOQueueHandler', 'DOShardedTagCache', 'BucketCachePurge'],
      },
    ],
  };
}
