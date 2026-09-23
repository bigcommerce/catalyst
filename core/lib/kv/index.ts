import { MemoryKvAdapter, SHARED_STORE_RECHECK_MS } from './adapters/memory';
import { KvAdapter, SetCommandOptions } from './types';

interface Config {
  logger?: boolean;
}

// L1 in front of whichever adapter `createKVAdapter` selects. Expires so a
// process periodically re-reads the shared store and picks up values other
// processes wrote.
const memoryKv = new MemoryKvAdapter({ ttlMs: SHARED_STORE_RECHECK_MS });

class KV<Adapter extends KvAdapter> implements KvAdapter {
  private kv?: Adapter;
  private memoryKv = memoryKv;

  constructor(
    private createAdapter: () => Promise<Adapter>,
    private config: Config = {},
  ) {}

  async get<Data>(key: string) {
    const [value] = await this.mget<Data>(key);

    return value ?? null;
  }

  async mget<Data>(...keys: string[]) {
    const kv = await this.getKv();

    const memoryValues = (await this.memoryKv.mget<Data>(...keys)).filter(Boolean);

    if (memoryValues.length === keys.length) {
      this.logger(
        `MGET - Keys: ${keys.toString()} - Value: ${JSON.stringify(memoryValues, null, 2)}`,
      );

      return memoryValues;
    }

    const values = await kv.mget<Data>(...keys);

    this.logger(`MGET - Keys: ${keys.toString()} - Value: ${JSON.stringify(values, null, 2)}`);

    // Store the values in memory kv
    await Promise.all(
      values.map(async (value, index) => {
        const key = keys[index];

        if (!key) {
          return;
        }

        await this.memoryKv.set(key, value);
      }),
    );

    return values;
  }

  async set<Data>(key: string, value: Data, opts?: SetCommandOptions) {
    const kv = await this.getKv();

    this.logger(`SET - Key: ${key} - Value: ${JSON.stringify(value, null, 2)}`);

    await Promise.all([this.memoryKv.set(key, value, opts), kv.set(key, value, opts)]);

    return value;
  }

  private async getKv() {
    if (!this.kv) {
      this.kv = await this.createAdapter();
    }

    return this.kv;
  }

  private logger(message: string) {
    if (this.config.logger) {
      // eslint-disable-next-line no-console
      console.log(`[BigCommerce] KV ${message}`);
    }
  }
}

// Exported for tests: the adapter chosen here depends on ambient runtime
// state (env vars, the Cloudflare context global) that can't be observed
// through the memoized `kv` singleton below.
export async function createKVAdapter() {
  // Prioritize Runtime Cache for Vercel environments
  if (process.env.VERCEL === '1') {
    const { RuntimeCacheAdapter } = await import('./adapters/vercel-runtime-cache');

    return new RuntimeCacheAdapter();
  }

  // On BigCommerce Native Hosting (Cloudflare Workers for Platforms) each
  // project gets its own KV namespace bound as CATALYST_ROUTES_KV. Without
  // this branch we'd fall through to MemoryKvAdapter, which isn't shared
  // across edge invocations. `getRoutesKvNamespace` returns null on every
  // other runtime, so this is a no-op off Cloudflare.
  const { CloudflareKvAdapter, getRoutesKvNamespace } = await import('./adapters/cloudflare-kv');
  const routesKvNamespace = getRoutesKvNamespace();

  if (routesKvNamespace) {
    return new CloudflareKvAdapter(routesKvNamespace);
  }

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { UpstashKvAdapter } = await import('./adapters/upstash');

    return new UpstashKvAdapter();
  }

  // Deliberately unbounded, unlike the L1 above. This is the fallback when no
  // shared store is configured, so there is nothing to re-read: expiring here
  // would empty both layers together and leave `with-routes` with no cached
  // value, sending every request past the window into its blocking origin
  // fetch rather than its background refresh.
  return new MemoryKvAdapter();
}

const adapterInstance = new KV(createKVAdapter, {
  logger:
    (process.env.NODE_ENV !== 'production' && process.env.KV_LOGGER !== 'false') ||
    process.env.KV_LOGGER === 'true',
});

export { adapterInstance as kv };
