/* eslint-disable @typescript-eslint/require-await */
import { KvAdapter } from '../types';

export class DevKvAdapter implements KvAdapter {
  private kv = new Map<string, unknown>();

  constructor() {
    // eslint-disable-next-line no-console
    console.log(`
[BigCommerce] --------------------------------
[BigCommerce] KV WARNING: Using DevKvAdapter.
[BigCommerce] This KV adapter does not persist data or support key expiration.
[BigCommerce] --------------------------------
`);
  }

  async get<Data>(key: string) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const value = this.kv.get(key) as Data;

    return value;
  }

  async set<Data>(key: string, value: Data) {
    this.kv.set(key, value);

    return value;
  }
}
