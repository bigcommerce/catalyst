import { getComputeCache } from '@vercel/catalyst-vdc';
import type { NextRequest } from 'next/server';

import type { KvAdapter, SetCommandOptions } from '../types';

export class VercelDataCacheAdapter implements KvAdapter {
  private request?: NextRequest;

  setRequest(request: NextRequest) {
    this.request = request;
  }

  async mget<Data>(...keys: string[]) {
    const computeCache = await getComputeCache<Data>(this.request);

    const values = await Promise.all(
      keys.map(async (key) => {
        const value = await computeCache.get(key);

        return value ?? null;
      }),
    );

    return values;
  }

  async set<Data>(key: string, value: Data, opts?: SetCommandOptions) {
    const computeCache = await getComputeCache<Data>(this.request);

    // expiryTime is in milliseconds, so we need to convert it to seconds
    const revalidate = opts?.expiryTime ? Number(opts.expiryTime) / 1000 : 0;

    const response = await computeCache.set(key, value, { revalidate });

    if (response === 'OK') {
      return null;
    }

    return response;
  }
}
