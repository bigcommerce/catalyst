import { QueryBatcher } from './generated/runtime/batcher';
import  { type BatchOptions } from './generated/runtime/fetcher';

export interface BigCommerceResponse<T> {
  data: T;
}

export interface FetcherConfig {
  storeHash: string;
  key: string;
  xAuthToken: string;
  batch?: BatchOptions | boolean
}

export interface FetcherInput {
  query: string;
  variables?: Record<string | symbol, unknown>;
}

const DEFAULT_BATCH_OPTIONS = {
  maxBatchSize: 10,
  batchInterval: 40,
}


export function customWrappedFetch<U>(config: FetcherConfig) {
  return (data: FetcherInput) => {
    if (!config.batch) {
      return bigcommerceFetch<U>({
        ...data,
        ...config,
      });
    }

    const batcher = new QueryBatcher(
      async (batchedQuery) => {
          const json = await bigcommerceFetch(batchedQuery) // fix type
          return json as any; // fix
      },
      config.batch === true ? DEFAULT_BATCH_OPTIONS : config.batch,
  )

  return async ({ query, variables }) => { // fix type
      const json = await batcher.fetch(query, variables)
      if (json?.data) {
          return json.data
      }
      throw new Error(
          'Genql batch fetcher returned unexpected result ' + JSON.stringify(json),
      )
  }
  };
}

export async function bigcommerceFetch<T>({
  storeHash,
  key,
  query,
  variables,
  headers,
  cache = 'force-cache',
  ...rest
}: FetcherInput & FetcherConfig & RequestInit): Promise<BigCommerceResponse<T> | never> {
  const endpoint = `https://store-${storeHash}.mybigcommerce.com/graphql`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      ...headers,
    },
    body: JSON.stringify({
      query,
      ...(variables && { variables }),
    }),
    cache,
    ...rest,
  });

  if (!response.ok) {
    throw new Error(`BigCommerce API returned ${response.status}`);
  }

  return response.json() as Promise<BigCommerceResponse<T> | never>;
}
