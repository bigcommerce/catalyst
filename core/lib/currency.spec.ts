import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setPreferredCurrencyCode } from './currency';

const { mockCookieStore, mockFetch, mockHasConsentFor } = vi.hoisted(() => ({
  mockCookieStore: { delete: vi.fn(), set: vi.fn() },
  mockFetch: vi.fn(),
  mockHasConsentFor: vi.fn(),
}));

vi.mock('next/headers', () => ({ cookies: () => Promise.resolve(mockCookieStore) }));
vi.mock('~/client', () => ({ client: { fetch: mockFetch } }));
vi.mock('~/lib/consent-manager/has-consent-for', () => ({ hasConsentFor: mockHasConsentFor }));

const defaultCurrencyResponse = (defaultCurrency: string) => ({
  data: { site: { settings: { currency: { defaultCurrency } } } },
});

describe('setPreferredCurrencyCode', () => {
  beforeEach(() => {
    mockCookieStore.delete.mockReset();
    mockCookieStore.set.mockReset();
    mockFetch.mockReset();
    mockFetch.mockResolvedValue(defaultCurrencyResponse('USD'));
    mockHasConsentFor.mockReset();
    mockHasConsentFor.mockResolvedValue(true);
  });

  it('clears the cookie when switching to the store default', async () => {
    await setPreferredCurrencyCode('USD');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ fetchOptions: { cache: 'no-store' } }),
    );
    expect(mockCookieStore.delete).toHaveBeenCalledWith('currencyCode');
    expect(mockCookieStore.set).not.toHaveBeenCalled();
  });

  it('stores a non-default currency', async () => {
    await setPreferredCurrencyCode('EUR');

    expect(mockCookieStore.set).toHaveBeenCalledWith('currencyCode', 'EUR', expect.any(Object));
    expect(mockCookieStore.delete).not.toHaveBeenCalled();
  });

  it('does not store a non-default currency without consent', async () => {
    mockHasConsentFor.mockResolvedValue(false);

    await setPreferredCurrencyCode('EUR');

    expect(mockCookieStore.set).not.toHaveBeenCalled();
  });

  it('stores the currency when the default lookup fails', async () => {
    mockFetch.mockRejectedValue(new Error('fetch failed'));

    await setPreferredCurrencyCode('USD');

    expect(mockCookieStore.set).toHaveBeenCalledWith('currencyCode', 'USD', expect.any(Object));
  });
});
