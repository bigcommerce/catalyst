export function getWranglerConfig(projectUuid: string, kvNamespaceId: string) {
  const sanitizedProjectId = projectUuid
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const workerName = sanitizedProjectId ? `project-${sanitizedProjectId}` : "project";

  return {
    $schema: 'node_modules/wrangler/config-schema.json',
    main: '../.open-next/worker.js',
    name: workerName,
    compatibility_date: '2025-07-15',
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
        service: workerName,
      },
    ],
    kv_namespaces: [
      {
        binding: 'NEXT_INC_CACHE_KV',
        id: kvNamespaceId,
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
