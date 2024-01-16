export interface BigCommerceResponse<T> {
  data: T;
}

export interface FetcherConfig {
  storeHash: string;
  key: string;
  xAuthToken: string;
  channelId?: string;
}

export interface FetcherInput {
  query: string;
  variables?: Record<string | symbol, unknown>;
}

export interface FetcherRequestInit extends Omit<RequestInit, 'cache'> {
  cache?: RequestCache | null;
}

export function customWrappedFetch<U>(config: FetcherConfig) {
  return (data: FetcherInput) => {
    return bigcommerceFetch<U>({
      ...data,
      ...config,
    });
  };
}

// Not all sites have the channel-specific canonical URL backfilled.
// Wait till MSF-2643 is resolved before removing and simplifying the endpoint logic.
const getEndpoint = ({ channelId, storeHash }: Pick<FetcherConfig, 'channelId' | 'storeHash'>) => {
  if (!channelId || channelId === '1') {
    return `https://store-${storeHash}.mybigcommerce.com/graphql`;
  }

  return `https://store-${storeHash}-${channelId}.mybigcommerce.com/graphql`;
};

export async function bigcommerceFetch<T>({
  storeHash,
  key,
  channelId,
  query,
  variables,
  headers,
  cache = 'force-cache',
  ...rest
}: FetcherInput & FetcherConfig & FetcherRequestInit): Promise<BigCommerceResponse<T> | never> {
  const endpoint = getEndpoint({ channelId, storeHash });

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
    ...(cache && { cache }),
    ...rest,
  });

  if (!response.ok) {
    throw new Error(`BigCommerce API returned ${response.status}`);
  }

  return response.json() as Promise<BigCommerceResponse<T> | never>;
}
