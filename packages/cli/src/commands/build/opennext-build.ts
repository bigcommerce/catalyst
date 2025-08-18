import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import { build } from '@opennextjs/cloudflare/cli/build/build';
import { getNormalizedOptions } from '@opennextjs/cloudflare/cli/commands/utils';
import { purgeCache } from '@opennextjs/cloudflare/overrides/cache-purge/index';
import kvIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';
import queueCache from '@opennextjs/cloudflare/overrides/queue/queue-cache';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';
import consola from 'consola';
import { build as esbuild, Plugin } from 'esbuild';
import { execa } from 'execa';
import { copyFile, cp, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import { getModuleCliPath } from '../../lib/get-module-cli-path';
import { mkTempDir } from '../../lib/mk-temp-dir';

const WRANGLER_VERSION = '4.24.3';

const require = createRequire(import.meta.url);

const myResolverPlugin: Plugin = {
  name: 'resolve-from-cli',
  setup(b) {
    b.onResolve({ filter: /^@opennextjs\/cloudflare(\/.*)?$/ }, (args) => {
      // Resolve from the CLI package, not from the Next.js app
      const resolved = require.resolve(args.path);

      return { path: resolved };
    });
  },
};

const nodeBuiltinsExternal: Plugin = {
  name: 'externalize-node-builtins',
  setup(b) {
    b.onResolve({ filter: /^node:/ }, () => ({ external: true }));
  },
};

export async function opennextBuild() {
  const [tmpdir, cleanup] = await mkTempDir('catalyst-build-');

  try {
    const openNextConfig = {
      buildCommand: 'next build',
      ...defineCloudflareConfig({
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
      }),
    };

    const wranglerConfig = {
      main: '../.open-next/worker.js',
      name: 'store-hash-project-uuid',
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
          service: 'store-hash-project-uuid',
        },
      ],
      kv_namespaces: [
        {
          binding: 'NEXT_INC_CACHE_KV',
          id: 'placeholder-kv-id',
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

    await copyFile(
      join(getModuleCliPath(), 'templates', 'open-next.config.ts'),
      join(process.cwd(), 'open-next.config.ts'),
    );
    await writeFile(
      join(process.cwd(), '.bigcommerce', 'wrangler.jsonc'),
      JSON.stringify(wranglerConfig, null, 2),
    );

    await esbuild({
      entryPoints: [join(process.cwd(), 'open-next.config.ts')],
      outfile: join(tmpdir, 'open-next.config.mjs'),
      bundle: true,
      format: 'esm',
      target: ['node18'],
      plugins: [myResolverPlugin],
      platform: 'node',
      banner: {
        js: [
          "import { createRequire as topLevelCreateRequire } from 'module';",
          'const require = topLevelCreateRequire(import.meta.url);',
          "import bannerUrl from 'url';",
          "const __dirname = bannerUrl.fileURLToPath(new URL('.', import.meta.url));",
        ].join(''),
      },
    });

    await esbuild({
      entryPoints: [join(process.cwd(), 'open-next.config.ts')],
      outfile: join(tmpdir, 'open-next.config.edge.mjs'),
      bundle: true,
      format: 'esm',
      target: ['es2020'],
      conditions: ['worker', 'browser'],
      platform: 'browser',
      plugins: [myResolverPlugin, nodeBuiltinsExternal],
      define: {
        // with the default esbuild config, the NODE_ENV will be set to "development", we don't want that
        'process.env.NODE_ENV': '"production"',
      },
    });

    const buildOptions = getNormalizedOptions(openNextConfig, tmpdir);

    await build(
      buildOptions,
      openNextConfig,
      {
        sourceDir: process.cwd(),
        skipNextBuild: false,
        skipWranglerConfigCheck: true,
        minify: false,
      },
      // @ts-expect-error - @todo fix types
      wranglerConfig,
    );

    await execa(
      'pnpm',
      [
        'dlx',
        `wrangler@${WRANGLER_VERSION}`,
        'deploy',
        '--config',
        join(process.cwd(), '.bigcommerce', 'wrangler.jsonc'),
        '--keep-vars',
        '--outdir',
        join(process.cwd(), '.bigcommerce', 'dist'),
        '--dry-run',
      ],
      {
        stdout: ['pipe', 'inherit'],
        cwd: process.cwd(),
      },
    );

    await cp(
      join(process.cwd(), '.open-next', 'assets'),
      join(process.cwd(), '.bigcommerce', 'dist', 'assets'),
      {
        recursive: true,
        force: true,
      },
    );
  } catch (error) {
    consola.error(error);

    process.exitCode = 1;
  } finally {
    await rm(join(process.cwd(), 'open-next.config.ts'));
    await cleanup();

    process.exit();
  }
}
