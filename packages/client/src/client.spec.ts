import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BigCommerceAPIError } from './api-error';
import { createClient } from './client';
import { BigCommerceGQLError } from './gql-error';
import { DocumentDecoration } from './types';

// The client accepts raw query strings at runtime; the cast only satisfies the typed overloads.
const QUERY = 'query GetSite { site { settings { storeName } } }' as DocumentDecoration<
  unknown,
  Record<string, never>
>;
const MUTATION =
  'mutation AddItem { cart { addCartLineItems { cart { entityId } } } }' as DocumentDecoration<
    unknown,
    Record<string, never>
  >;

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Mimics undici when the connection drops while the body is being read.
function droppedBodyResponse() {
  const response = jsonResponse({});

  vi.spyOn(response, 'json').mockRejectedValue(new TypeError('terminated'));

  return response;
}

const client = createClient({ storeHash: 'abc123', storefrontToken: 'token', channelId: '1' });

// Advances through the retry delays so the test doesn't wait on real timers.
async function settle<T>(promise: Promise<T>): Promise<{ value?: T; error?: unknown }> {
  const settled = promise.then(
    (value) => ({ value }),
    (error: unknown) => ({ error }),
  );

  await vi.runAllTimersAsync();

  return settled;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe('client.fetch retries', () => {
  it('retries a query after a 502', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, 502))
      .mockResolvedValueOnce(jsonResponse({ data: { site: {} } }));

    const result = await settle(client.fetch({ document: QUERY }));

    expect(result).toEqual({ value: { data: { site: {} } } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries a query when the connection drops', async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(jsonResponse({ data: { site: {} } }));

    const result = await settle(client.fetch({ document: QUERY }));

    expect(result).toEqual({ value: { data: { site: {} } } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries a query when the body read is cut off', async () => {
    fetchMock
      .mockResolvedValueOnce(droppedBodyResponse())
      .mockResolvedValueOnce(jsonResponse({ data: { site: {} } }));

    const result = await settle(client.fetch({ document: QUERY }));

    expect(result).toEqual({ value: { data: { site: {} } } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('gives up after the retry limit', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse({}, 503)));

    const result = await settle(client.fetch({ document: QUERY }));

    expect(result.error).toBeInstanceOf(BigCommerceAPIError);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('does not retry a mutation', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 502));

    const result = await settle(client.fetch({ document: MUTATION }));

    expect(result.error).toBeInstanceOf(BigCommerceAPIError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not retry a 4xx', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 400));

    const result = await settle(client.fetch({ document: QUERY }));

    expect(result.error).toBeInstanceOf(BigCommerceAPIError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not retry GraphQL errors', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ data: null, errors: [{ message: 'Bad field', path: [], locations: [] }] }),
    );

    const result = await settle(client.fetch({ document: QUERY }));

    expect(result.error).toBeInstanceOf(BigCommerceGQLError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not retry once the request is aborted', async () => {
    const controller = new AbortController();

    fetchMock.mockImplementationOnce(() => {
      controller.abort();

      return Promise.reject(new TypeError('fetch failed'));
    });

    const result = await settle(
      client.fetch({ document: QUERY, fetchOptions: { signal: controller.signal } }),
    );

    expect(result.error).toBeInstanceOf(TypeError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
