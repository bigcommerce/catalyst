import { describe, expect, it } from 'vitest';

import {
  getCollectionProductsUrl,
  getProductsByIdsUrl,
  getProductsCacheControl,
  normalizeProductIds,
  parseProductsViewer,
} from './products-api';

describe('normalizeProductIds', () => {
  it('sorts and dedupes ids', () => {
    expect(normalizeProductIds(['12', '3', '12', ' 7 '])).toEqual([3, 7, 12]);
  });

  it('drops empty and invalid ids', () => {
    expect(normalizeProductIds(['', 'abc', '4x', '-1', '0', '1.5', '9'])).toEqual([9]);
  });
});

describe('getProductsByIdsUrl', () => {
  it('uses the same URL for the same set of ids', () => {
    const viewer = { guest: true, currencyCode: 'EUR' } as const;

    expect(getProductsByIdsUrl(['5', '1', '3'], 'en', viewer)).toBe(
      getProductsByIdsUrl(['3', '5', '1', '1'], 'en', viewer),
    );
    expect(getProductsByIdsUrl(['5', '1'], 'en', viewer)).toBe(
      '/api/products/ids?ids=1%2C5&locale=en&guest=1&currency=EUR',
    );
  });

  it('omits guest params for signed-in shoppers', () => {
    expect(getProductsByIdsUrl(['2'], 'fr', { guest: false })).toBe(
      '/api/products/ids?ids=2&locale=fr',
    );
  });

  it('returns null when there are no valid ids', () => {
    expect(getProductsByIdsUrl(['', 'abc'], 'en', { guest: true })).toBeNull();
  });
});

describe('getCollectionProductsUrl', () => {
  it('encodes the guest currency', () => {
    expect(getCollectionProductsUrl('featured', 'en', { guest: true, currencyCode: 'USD' })).toBe(
      '/api/products/group/featured?locale=en&guest=1&currency=USD',
    );
  });

  it('omits the currency when the guest has none', () => {
    expect(getCollectionProductsUrl('newest', 'en', { guest: true })).toBe(
      '/api/products/group/newest?locale=en&guest=1',
    );
  });

  it('omits guest params for signed-in shoppers', () => {
    expect(getCollectionProductsUrl('best-selling', 'en', { guest: false })).toBe(
      '/api/products/group/best-selling?locale=en',
    );
  });
});

describe('parseProductsViewer', () => {
  const parse = (query: string) => parseProductsViewer(new URLSearchParams(query));

  it('round-trips the URLs it builds', () => {
    const viewer = { guest: true, currencyCode: 'EUR' } as const;
    const url = new URL(getCollectionProductsUrl('featured', 'en', viewer), 'https://example.com');

    expect(parseProductsViewer(url.searchParams)).toEqual({ success: true, viewer });
  });

  it('returns no viewer for session-based requests', () => {
    expect(parse('locale=en')).toEqual({ success: true, viewer: null });
    expect(parse('locale=en&currency=EUR')).toEqual({ success: true, viewer: null });
  });

  it('parses a guest without a currency', () => {
    expect(parse('guest=1')).toEqual({ success: true, viewer: { guest: true } });
  });

  it('rejects invalid or non-canonical currencies', () => {
    expect(parse('guest=1&currency=EURO')).toEqual({ success: false });
    expect(parse('guest=1&currency=eur')).toEqual({ success: false });
    expect(parse('guest=1&currency=')).toEqual({ success: false });
  });
});

describe('getProductsCacheControl', () => {
  it('allows shared caching of successful guest responses', () => {
    expect(getProductsCacheControl({ guest: true }, true, 3600)).toBe(
      'public, s-maxage=60, stale-while-revalidate=3600',
    );
  });

  it('keeps errors and session-based responses out of shared caches', () => {
    expect(getProductsCacheControl({ guest: true }, false, 3600)).toBe('private, no-store');
    expect(getProductsCacheControl(null, true, 3600)).toBe('private, no-store');
    expect(getProductsCacheControl({ guest: false }, true, 3600)).toBe('private, no-store');
  });
});
