/* eslint-disable @typescript-eslint/require-await */
import { KvAdapter } from '../types';

export class NoopKvAdapter implements KvAdapter {
  constructor() {
    // eslint-disable-next-line no-console
    console.log(`
[BigCommerce] --------------------------------
[BigCommerce] KV WARNING: Using NoopKvAdapter.
[BigCommerce] This KV adapter does nothing and requests will be uncached.
[BigCommerce] --------------------------------
`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get<Data>(_key: string) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return null as Data;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async mget<Data>(..._keys: string[]) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return [] as Data[];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async set<Data>(_key: string, value: Data, _options: { ex?: number } = {}) {
    return value;
  }
}
