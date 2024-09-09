import { MemoryKvAdapter } from './adapters/memory';
import { KvAdapter, SetCommandOptions } from './types';

interface Config {
  logger?: boolean;
}

const memoryKv = new MemoryKvAdapter();

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

async function createKVAdapter() {
  if (process.env.BC_KV_REST_API_URL && process.env.BC_KV_REST_API_TOKEN) {
    const { BcKvAdapter } = await import('./adapters/bc');

    return new BcKvAdapter();
  }

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { VercelKvAdapter } = await import('./adapters/vercel');

    return new VercelKvAdapter();
  }

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { UpstashKvAdapter } = await import('./adapters/upstash');

    return new UpstashKvAdapter();
  }

  return new MemoryKvAdapter();
}

const adapterInstance = new KV(createKVAdapter, {
  logger:
    (process.env.NODE_ENV !== 'production' && process.env.KV_LOGGER !== 'false') ||
    process.env.KV_LOGGER === 'true',
});

export { adapterInstance as kv };
