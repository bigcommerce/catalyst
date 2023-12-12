import { vercelKvAdapter } from './adapters/vercel';
import { KvAdapter, SetCommandOptions } from './types';

class KV<Adapter extends KvAdapter> implements KvAdapter {
  private kv: Adapter;
  private namespace: string;

  constructor(adapter: Adapter) {
    this.kv = adapter;
    this.namespace =
      process.env.KV_NAMESPACE ??
      `${process.env.BIGCOMMERCE_STORE_HASH ?? 'store'}_${
        process.env.BIGCOMMERCE_CHANNEL_ID ?? '1'
      }`;
  }

  async get<Data>(key: string) {
    return this.kv.get<Data>(`${this.namespace}_${key}`);
  }

  async set<Data, Options extends SetCommandOptions = SetCommandOptions>(
    key: string,
    value: Data,
    opts?: Options,
  ) {
    return this.kv.set(`${this.namespace}_${key}`, value, opts);
  }
}

export const kv = new KV(vercelKvAdapter);
