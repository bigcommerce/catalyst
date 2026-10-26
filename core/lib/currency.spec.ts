import { beforeEach, describe, expect, it, vi } from 'vitest';

import { revalidate } from '~/client/revalidate-target';

import { getPreferredCurrencyCode, getSelectedCurrencyCode } from './currency';

const { mockCookieValue, mockFetch } = vi.hoisted(() => ({
  mockCookieValue: vi.fn<() => string | undefined>(),
  mockFetch: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: () => {
    const value = mockCookieValue();

    return Promise.resolve({ get: () => (value ? { value } : undefined) });
  },
}));
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  cache: <T>(fn: T) => fn,
}));
vi.mock('~/client', () => ({ client: { fetch: mockFetch } }));
vi.mock('~/lib/consent-manager/has-consent-for', () => ({ hasConsentFor: vi.fn() }));

const defaultCurrencyResponse = (defaultCurrency: string) => ({
  data: { site: { settings: { currency: { defaultCurrency } } } },
});

describe('getPreferredCurrencyCode', () => {
  beforeEach(() => {
    mockCookieValue.mockReset();
    mockFetch.mockReset();
    mockFetch.mockResolvedValue(defaultCurrencyResponse('USD'));
  });

  it('returns undefined without a cookie', async () => {
    await expect(getPreferredCurrencyCode()).resolves.toBeUndefined();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns undefined when the cookie holds the store default', async () => {
    mockCookieValue.mockReturnValue('USD');

    await expect(getPreferredCurrencyCode()).resolves.toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ fetchOptions: { next: { revalidate } } }),
    );
  });

  it('returns a non-default currency', async () => {
    mockCookieValue.mockReturnValue('EUR');

    await expect(getPreferredCurrencyCode()).resolves.toBe('EUR');
  });

  it('getSelectedCurrencyCode keeps the store default', async () => {
    mockCookieValue.mockReturnValue('USD');

    await expect(getSelectedCurrencyCode()).resolves.toBe('USD');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('keeps the cookie currency when the default lookup fails', async () => {
    mockCookieValue.mockReturnValue('USD');
    mockFetch.mockRejectedValue(new Error('fetch failed'));

    await expect(getPreferredCurrencyCode()).resolves.toBe('USD');
  });
});
