export interface BigCommerceResponse<T> {
  data: T;
}

export interface FetcherConfig {
  storeHash: string;
  key: string;
  xAuthToken: string;
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

export async function bigcommerceFetch<T>({
  storeHash,
  key,
  query,
  variables,
  headers,
  cache = 'force-cache',
  ...rest
}: FetcherInput & FetcherConfig & FetcherRequestInit): Promise<BigCommerceResponse<T> | never> {
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
    ...(cache && { cache }),
    ...rest,
  });

  if (!response.ok) {
    throw new Error(`BigCommerce API returned ${response.status}`);
  }

  return response.json() as Promise<BigCommerceResponse<T> | never>;
}
