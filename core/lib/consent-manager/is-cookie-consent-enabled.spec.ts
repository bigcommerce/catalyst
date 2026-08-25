import { NextFetchEvent } from 'next/dist/server/web/spec-extension/fetch-event';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { COOKIE_CONSENT_KEY, kvKey } from '~/lib/kv/keys';

import { isCookieConsentEnabled } from './is-cookie-consent-enabled';

const { cache, mockFetch, mockKvGet, mockKvSet, mockWaitUntil } = vi.hoisted(() => ({
  cache: new Map<string, unknown>(),
  mockFetch: vi.fn(),
  mockKvGet: vi.fn(),
  mockKvSet: vi.fn(),
  mockWaitUntil: vi.fn(),
}));

vi.mock('~/client', () => ({ client: { fetch: mockFetch } }));
vi.mock('~/lib/kv', () => ({ kv: { get: mockKvGet, set: mockKvSet } }));

const cacheKey = kvKey(COOKIE_CONSENT_KEY);

const settingResponse = (cookieConsentEnabled: boolean) => ({
  data: {
    site: {
      settings: {
        privacy: { cookieConsentEnabled },
      },
    },
  },
});

describe('isCookieConsentEnabled', () => {
  beforeEach(() => {
    cache.clear();
    mockFetch.mockReset();
    mockKvGet.mockReset();
    mockKvSet.mockReset();
    mockWaitUntil.mockReset();

    mockKvGet.mockImplementation((key: string) => cache.get(key) ?? null);
    mockKvSet.mockImplementation((key: string, value: unknown) => {
      cache.set(key, value);

      return Promise.resolve(value);
    });

    mockWaitUntil.mockImplementation(() => undefined);
  });

  it('returns a fresh cache hit without fetching', async () => {
    cache.set(cacheKey, {
      cookieConsentEnabled: true,
      expiryTime: Date.now() + 1000,
    });

    await expect(isCookieConsentEnabled()).resolves.toBe(true);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns an expired value and refreshes it in the background', async () => {
    cache.set(cacheKey, {
      cookieConsentEnabled: false,
      expiryTime: Date.now() - 1000,
    });
    mockFetch.mockResolvedValue(settingResponse(true));

    let refreshPromise: Promise<unknown> | undefined;

    mockWaitUntil.mockImplementation((promise: Promise<unknown>) => {
      refreshPromise = promise;
    });

    const event = new NextFetchEvent({
      request: new NextRequest('http://localhost'),
      page: '',
      context: { waitUntil: mockWaitUntil },
    });

    await expect(isCookieConsentEnabled(event)).resolves.toBe(false);

    expect(mockFetch).toHaveBeenCalledOnce();
    expect(mockWaitUntil).toHaveBeenCalledOnce();

    if (!refreshPromise) {
      throw new Error('Expected a background refresh');
    }

    await refreshPromise;
    expect(mockKvSet).toHaveBeenCalledWith(
      cacheKey,
      expect.objectContaining({ cookieConsentEnabled: true }),
    );
  });

  it('fetches and writes a cache miss', async () => {
    mockFetch.mockResolvedValue(settingResponse(true));

    await expect(isCookieConsentEnabled()).resolves.toBe(true);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ fetchOptions: { cache: 'no-store' } }),
    );
    expect(mockKvSet).toHaveBeenCalledWith(
      cacheKey,
      expect.objectContaining({ cookieConsentEnabled: true }),
    );
  });

  it('returns null when a cache miss fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('fetch failed'));

    await expect(isCookieConsentEnabled()).resolves.toBeNull();
    expect(mockKvSet).not.toHaveBeenCalled();
  });

  it('treats missing settings as implicit consent', async () => {
    mockFetch.mockResolvedValue({ data: { site: { settings: null } } });

    await expect(isCookieConsentEnabled()).resolves.toBe(false);
  });

  it('treats a malformed cache entry as a miss', async () => {
    cache.set(cacheKey, { cookieConsentEnabled: 'yes', expiryTime: 'later' });
    mockFetch.mockResolvedValue(settingResponse(false));

    await expect(isCookieConsentEnabled()).resolves.toBe(false);
    expect(mockFetch).toHaveBeenCalledOnce();
    expect(mockKvSet).toHaveBeenCalledWith(
      cacheKey,
      expect.objectContaining({ cookieConsentEnabled: false }),
    );
  });
});
