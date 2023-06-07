const domain = process.env.BIGCOMMERCE_STOREFRONT_DOMAIN ?? '';
const endpoint = `${domain}/graphql`;
const key = process.env.BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN ?? '';

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
  next?: any;
  // next?: NextFetchRequestConfig;
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
    // TODO: Make this not next-specific
    // @ts-expect-error
    next,
  });

  if (!response.ok) {
    throw new Error(`BigCommerce API returned ${response.status}`);
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return response.json() as Promise<BigCommerceResponse<T> | never>;
}
