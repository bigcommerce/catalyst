import 'server-only';

const domain = process.env.BIGCOMMERCE_STOREFRONT_DOMAIN ?? '';
const endpoint = `${domain}/graphql`;
const key = process.env.BIGCOMMERCE_STOREFRONT_TOKEN ?? '';

interface BigCommerceResponse<T> {
  data: T;
}

export async function bigcommerceFetch<T>({
  query,
  variables,
  headers,
  cache = 'force-cache',
  next,
}: {
  query: string;
  variables?: Record<string | symbol, unknown>;
  headers?: HeadersInit;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}): Promise<BigCommerceResponse<T> | never> {
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
    next,
  });

  if (!response.ok) {
    throw new Error(`BigCommerce API returned ${response.status}`);
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return response.json() as Promise<BigCommerceResponse<T> | never>;
}
