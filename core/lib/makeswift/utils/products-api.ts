import type { CurrencyCode } from '~/components/header/fragment';
import { CurrencyCodeSchema } from '~/components/header/schema';

/**
 * Who product prices are fetched for. Guest responses are shared through the CDN, so a guest URL
 * carries everything the response depends on and the route ignores the request's cookies for it.
 * Signed-in shoppers can see customer-group pricing, so they never request a guest URL.
 */
export type ProductsViewer = { guest: true; currencyCode?: CurrencyCode } | { guest: false };

export type ProductCollection = 'best-selling' | 'featured' | 'newest';

const GUEST_PARAM = 'guest';
const CURRENCY_PARAM = 'currency';

// Short CDN freshness on top of the Data Cache, so price changes show up within about a minute.
const GUEST_S_MAXAGE = 60;

function appendViewer(searchParams: URLSearchParams, viewer: ProductsViewer) {
  if (!viewer.guest) {
    return;
  }

  searchParams.append(GUEST_PARAM, '1');

  if (viewer.currencyCode) {
    searchParams.append(CURRENCY_PARAM, viewer.currencyCode);
  }
}

// Sorted and deduped so the same set of products always maps to one URL.
export function normalizeProductIds(ids: string[]): number[] {
  const entityIds = ids
    .filter((id) => /^\d+$/.test(id.trim()))
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isSafeInteger(id) && id > 0);

  return Array.from(new Set(entityIds)).sort((a, b) => a - b);
}

export function getCollectionProductsUrl(
  collection: ProductCollection,
  locale: string,
  viewer: ProductsViewer,
): string {
  const searchParams = new URLSearchParams({ locale });

  appendViewer(searchParams, viewer);

  return `/api/products/group/${collection}?${searchParams.toString()}`;
}

export function getProductsByIdsUrl(
  ids: string[],
  locale: string,
  viewer: ProductsViewer,
): string | null {
  const entityIds = normalizeProductIds(ids);

  if (entityIds.length === 0) {
    return null;
  }

  const searchParams = new URLSearchParams({ ids: entityIds.join(','), locale });

  appendViewer(searchParams, viewer);

  return `/api/products/ids?${searchParams.toString()}`;
}

// `viewer` is `null` for non-guest requests, which resolve the shopper from the session.
export function parseProductsViewer(
  searchParams: URLSearchParams,
): { success: true; viewer: ProductsViewer | null } | { success: false } {
  if (searchParams.get(GUEST_PARAM) !== '1') {
    return { success: true, viewer: null };
  }

  const currency = searchParams.get(CURRENCY_PARAM);

  if (currency == null) {
    return { success: true, viewer: { guest: true } };
  }

  const result = CurrencyCodeSchema.safeParse(currency);

  if (!result.success || result.data !== currency) {
    return { success: false };
  }

  return { success: true, viewer: { guest: true, currencyCode: result.data } };
}

// Only successful guest responses may be stored by a shared cache.
export function getProductsCacheControl(
  viewer: ProductsViewer | null,
  isSuccess: boolean,
  staleWhileRevalidate: number,
): string {
  if (viewer?.guest && isSuccess) {
    return `public, s-maxage=${GUEST_S_MAXAGE}, stale-while-revalidate=${staleWhileRevalidate}`;
  }

  return 'private, no-store';
}
