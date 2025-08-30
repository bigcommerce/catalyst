import { MemoryFetchAdapter } from './adapters/memory-fetch';
import { FetchAdapter, FetchAdapterOptions } from './types';

interface Config {
  logger?: boolean;
}

class Fetch<Adapter extends FetchAdapter> implements FetchAdapter {
  private adapter?: Adapter;

  constructor(
    private createAdapter: () => Promise<Adapter>,
    private config: Config = {},
  ) {}

  async fetch(url: string | URL | Request, init?: RequestInit & FetchAdapterOptions): Promise<Response> {
    const adapter = await this.getAdapter();
    
    this.logger(`FETCH - URL: ${url.toString()} - Method: ${init?.method || 'GET'}`);
    
    const response = await adapter.fetch(url, init);
    
    const cacheStatus = response.headers.get('X-Cache-Status') || 'UNKNOWN';
    this.logger(`FETCH - URL: ${url.toString()} - Status: ${response.status} - Cache: ${cacheStatus}`);
    
    return response;
  }

  private async getAdapter() {
    if (!this.adapter) {
      this.adapter = await this.createAdapter();
    }

    return this.adapter;
  }

  private logger(message: string) {
    if (this.config.logger) {
      // eslint-disable-next-line no-console
      console.log(`[BigCommerce] Fetch ${message}`);
    }
  }
}

async function createFetchAdapter() {
  // Prioritize Vercel cached fetch for Vercel environments
  if (process.env.VERCEL === '1') {
    const { VercelCachedFetchAdapter } = await import('./adapters/vercel-cached-fetch');

    return new VercelCachedFetchAdapter();
  }

  // Use Upstash if Redis credentials are available
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { UpstashCachedFetchAdapter } = await import('./adapters/upstash-cached-fetch');

    return new UpstashCachedFetchAdapter();
  }

  // Fallback to memory (no caching)
  return new MemoryFetchAdapter();
}

const adapterInstance = new Fetch(createFetchAdapter, {
  logger:
    (process.env.NODE_ENV !== 'production' && process.env.FETCH_LOGGER !== 'false') ||
    process.env.FETCH_LOGGER === 'true',
});

export { adapterInstance as fetch };
export type { FetchAdapterOptions } from './types';