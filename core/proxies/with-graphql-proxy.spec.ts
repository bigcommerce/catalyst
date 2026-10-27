import { NextFetchEvent } from 'next/dist/server/web/spec-extension/fetch-event';
import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { withGraphqlProxy } from './with-graphql-proxy';

const clientFetch = vi.fn<(...args: unknown[]) => Promise<unknown>>();

vi.mock('~/client', () => ({
  client: { fetch: (...args: unknown[]) => clientFetch(...args) },
}));

vi.mock('~/auth', () => ({
  auth:
    (handler: (req: NextRequest & { auth: unknown }) => Promise<Response>) => (req: NextRequest) =>
      handler(Object.assign(req, { auth: { user: { customerAccessToken: 'customer-token' } } })),
}));

const next = vi.fn(() => NextResponse.next());
const proxy = withGraphqlProxy(next);
const event = new NextFetchEvent({
  request: new NextRequest('https://storefront.example.com/graphql'),
  page: '',
  context: undefined,
});

const checkoutRedirectMutation = `
  mutation CheckoutRedirectMutation($input: CreateCartRedirectUrlsInput!) {
    cart {
      createCartRedirectUrls(input: $input) {
        redirectUrls { externalCheckoutUrl }
      }
    }
  }
`;

const createCartMutation = `
  mutation CheckoutRedirectMutation($input: CreateCartInput!) {
    cart { createCart(input: $input) { cart { entityId } } }
  }
`;

const graphqlRequest = (
  body: unknown,
  {
    headers = { 'x-catalyst-graphql-proxy-requester': 'checkout-sdk-js' },
    method = 'POST',
  }: { headers?: Record<string, string>; method?: string } = {},
) =>
  new NextRequest('https://storefront.example.com/graphql', {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  });

describe('withGraphqlProxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('BIGCOMMERCE_STOREFRONT_UNAUTHENTICATED_TOKEN', 'storefront-token');
    clientFetch.mockResolvedValue({ data: { cart: {} } });
  });

  it('relays wallet button operations to BigCommerce', async () => {
    const variables = { input: { cartEntityId: 'cart-id' } };
    const response = await proxy(
      graphqlRequest({ query: checkoutRedirectMutation, variables }),
      event,
    );

    expect(response?.status).toBe(200);
    await expect(response?.json()).resolves.toEqual({ data: { cart: {} } });
    expect(clientFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        variables,
        customerAccessToken: 'customer-token',
        fetchOptions: {
          headers: { Authorization: 'Bearer storefront-token' },
          cache: 'no-store',
        },
      }),
    );
  });

  it('rejects operations that are not wallet button operations', async () => {
    const response = await proxy(
      graphqlRequest({ query: createCartMutation, variables: { input: {} } }),
      event,
    );

    expect(response?.status).toBe(403);
    expect(clientFetch).not.toHaveBeenCalled();
  });

  it.each([
    ['a missing query', { variables: {} }],
    ['a non-string query', { query: { kind: 'Document' } }],
  ])('rejects %s', async (_, body) => {
    const response = await proxy(graphqlRequest(body), event);

    expect(response?.status).toBe(400);
    expect(clientFetch).not.toHaveBeenCalled();
  });

  it('rejects a body that is not JSON', async () => {
    const request = new NextRequest('https://storefront.example.com/graphql', {
      method: 'POST',
      headers: { 'x-catalyst-graphql-proxy-requester': 'checkout-sdk-js' },
      body: 'not json',
    });

    const response = await proxy(request, event);

    expect(response?.status).toBe(400);
    expect(clientFetch).not.toHaveBeenCalled();
  });

  it('rejects non-POST requests', async () => {
    const response = await proxy(graphqlRequest(undefined, { method: 'GET' }), event);

    expect(response?.status).toBe(405);
  });

  it('passes through requests without the checkout-sdk-js requester header', async () => {
    await proxy(graphqlRequest({ query: createCartMutation }, { headers: {} }), event);

    expect(next).toHaveBeenCalled();
    expect(clientFetch).not.toHaveBeenCalled();
  });
});
