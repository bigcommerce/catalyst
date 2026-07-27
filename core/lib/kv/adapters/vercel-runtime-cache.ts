import { getCache } from '@vercel/functions';

import { KvAdapter, SetCommandOptions } from '../types';

export class RuntimeCacheAdapter implements KvAdapter {
  private cache = getCache();

  async mget<Data>(...keys: string[]): Promise<Array<Data | null>> {
    this.logger(
      `MGET - Keys: ${keys.toString()} - Source: RUNTIME_CACHE - Fetching ${keys.length} keys`,
    );

    try {
      const values = await Promise.all(
        keys.map(async (key) => {
          try {
            // Use the Runtime Cache API
            const cachedValue = await this.cache.get(key);

            if (cachedValue !== null) {
              this.logger(`RUNTIME_CACHE GET - Key: ${key} - Found: true`);

              return cachedValue;
            }

            this.logger(`RUNTIME_CACHE GET - Key: ${key} - Found: false`);

            return null;
          } catch (error) {
            this.logger(
              `RUNTIME_CACHE GET ERROR - Key: ${key} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );

            return null;
          }
        }),
      );

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return values as Array<Data | null>;
    } catch (error) {
      this.logger(
        `RUNTIME_CACHE ACCESS ERROR - Returning null values: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      // Return null for all keys if Runtime Cache is unavailable
      return keys.map(() => null);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async set<Data>(key: string, value: Data, _opts?: SetCommandOptions): Promise<Data | null> {
    this.logger(`SET - Key: ${key} - Setting in runtime cache`);

    try {
      await this.cache.set(key, value);
      this.logger(`RUNTIME_CACHE SET - Key: ${key} - Success`);
    } catch (error) {
      this.logger(
        `RUNTIME_CACHE SET ERROR - Key: ${key} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    return value;
  }

  private logger(message: string) {
    // Check if logging is enabled using the same logic as the main KV class
    const loggingEnabled =
      (process.env.NODE_ENV !== 'production' && process.env.KV_LOGGER !== 'false') ||
      process.env.KV_LOGGER === 'true';

    if (loggingEnabled) {
      // eslint-disable-next-line no-console
      console.log(`[BigCommerce] Runtime Cache ${message}`);
    }
  }
}
