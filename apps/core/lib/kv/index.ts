import { KvAdapter, SetCommandOptions } from './types';

interface Config {
  logger?: boolean;
}

class KV<Adapter extends KvAdapter> implements KvAdapter {
  private kv?: Adapter;
  private namespace: string;

  constructor(
    private createAdapter: () => Promise<Adapter>,
    private config: Config = {},
  ) {
    this.namespace =
      process.env.KV_NAMESPACE ??
      `${process.env.BIGCOMMERCE_STORE_HASH ?? 'store'}_${
        process.env.BIGCOMMERCE_CHANNEL_ID ?? '1'
      }`;
  }

  async get<Data>(key: string) {
    const kv = await this.getKv();
    const fullKey = `${this.namespace}_${key}`;

    const value = await kv.get<Data>(fullKey);

    this.logger(`GET - Key: ${fullKey} - Value: ${JSON.stringify(value, null, 2)}`);

    return value;
  }

  async mget<Data>(...keys: string[]) {
    const kv = await this.getKv();
    const fullKeys = keys.map((key) => `${this.namespace}_${key}`);

    const values = await kv.mget<Data>(...fullKeys);

    this.logger(`MGET - Keys: ${fullKeys.toString()} - Value: ${JSON.stringify(values, null, 2)}`);

    return values;
  }

  async set<Data, Options extends SetCommandOptions = SetCommandOptions>(
    key: string,
    value: Data,
    opts?: Options,
  ) {
    const kv = await this.getKv();
    const fullKey = `${this.namespace}_${key}`;

    this.logger(`SET - Key: ${fullKey} - Value: ${JSON.stringify(value, null, 2)}`);

    return kv.set(`${fullKey}`, value, opts);
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
  if (process.env.NODE_ENV === 'development' && !process.env.KV_REST_API_URL) {
    const { DevKvAdapter } = await import('./adapters/dev');

    return new DevKvAdapter();
  }

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { VercelKvAdapter } = await import('./adapters/vercel');

    return new VercelKvAdapter();
  }

  const { NoopKvAdapter } = await import('./adapters/noop');

  return new NoopKvAdapter();
}

const adapterInstance = new KV(createKVAdapter, {
  logger: process.env.NODE_ENV !== 'production' || process.env.KV_LOGGER === 'true',
});

export { adapterInstance as kv };
