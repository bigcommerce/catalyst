import { cache } from 'react';

import { getProductsByIds } from '~/client/queries/get-products-by-ids';
import { CurrencyCode } from '~/components/header/fragment';
import { getCatalogPath, getPlacement, getSearchClient } from '~/lib/vertex-retail/client';

import { transformVertexFacets } from './vertex-facets-transformer';

interface VertexSearchParams {
  // Allow any other filter parameters
  [key: string]: unknown;
  term?: string;
  after?: string; // pageToken for next page
  before?: string; // pageToken for prev page (not well supported by Vertex)
  first?: number; // page size
  sort?: string; // sort option
  brand?: string | string[]; // Brand filter
  category?: string | string[]; // Category filter
  color?: string | string[]; // Color filter
  minPrice?: string; // Min price filter
  maxPrice?: string; // Max price filter
}

// Map Catalyst sort options to Vertex AI orderBy parameter
// https://cloud.google.com/retail/docs/reference/rest/v2/projects.locations.catalogs.servingConfigs/search#request-body
function getVertexOrderBy(sort?: string): string {
  const sortMap: Record<string, string> = {
    featured: '', // Default relevance
    relevance: '', // Default relevance
    lowest_price: 'price asc',
    highest_price: 'price desc',
    a_to_z: 'title asc',
    z_to_a: 'title desc',
    // Note: 'newest', 'best_selling', 'best_reviewed' not directly supported by Vertex
    // These will fall back to relevance
  };

  return sortMap[sort || ''] || '';
}

/**
 * Normalize filter values from URL parameters to array format
 * Handles both array and comma-separated string formats
 * @param {unknown} value - Filter value (string, string[], or other)
 * @returns {string[]} Array of filter values
 */
function normalizeFilterValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  }

  if (typeof value === 'string') {
    return value.includes(',') ? value.split(',').map((v) => v.trim()) : [value];
  }

  return [String(value)];
}

/**
 * Build a filter clause with OR logic for multiple values
 * @param {string[]} values - Array of filter values
 * @param {string} fieldName - Vertex field name (e.g., 'brands', 'categories')
 * @returns {string} Filter string or empty string if no values
 */
function buildFilterClause(values: string[], fieldName: string): string {
  if (values.length === 0) return '';

  const filters = values.map((value) => `${fieldName}: ANY("${value}")`);

  return filters.length === 1 ? (filters[0] ?? '') : `(${filters.join(' OR ')})`;
}

/**
 * Build Vertex filter string from search params
 * https://cloud.google.com/retail/docs/filter-and-order#filter
 * @param {VertexSearchParams} params - Search parameters including filter values
 * @returns {string} Vertex filter string
 */
function buildVertexFilter(params: VertexSearchParams): string {
  const filters: string[] = [];

  // Brand filter
  if (params.brand) {
    const brandFilter = buildFilterClause(normalizeFilterValues(params.brand), 'brands');

    if (brandFilter.length > 0) {
      filters.push(brandFilter);
    }
  }

  // Category filter
  if (params.category) {
    const categoryFilter = buildFilterClause(normalizeFilterValues(params.category), 'categories');

    if (categoryFilter.length > 0) {
      filters.push(categoryFilter);
    }
  }

  // Color filter
  if (params.color) {
    const colorFilter = buildFilterClause(normalizeFilterValues(params.color), 'colorFamilies');

    if (colorFilter.length > 0) {
      filters.push(colorFilter);
    }
  }

  // Price range filter
  if (params.minPrice || params.maxPrice) {
    const minPrice = params.minPrice ? parseFloat(params.minPrice) : 0;
    const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : Number.MAX_SAFE_INTEGER;

    filters.push(`priceInfo.price: IN(${minPrice}, ${maxPrice})`);
  }

  // Join all filters with AND
  return filters.join(' AND ');
}

// Extract BigCommerce product ID from Vertex search result ID
// Supports formats: product-123, product:123, product/123, 123
function extractProductId(vertexId: string): number | null {
  const match = /product[-:/](\d+)/i.exec(vertexId);

  if (match?.[1]) {
    return Number.parseInt(match[1], 10);
  }

  // Try direct numeric ID
  if (/^\d+$/.test(vertexId)) {
    return Number.parseInt(vertexId, 10);
  }

  return null;
}

/**
 * Fetch search results using Vertex AI Search API
 * Falls back to empty results if Vertex is not configured
 */
export const fetchVertexSearch = cache(
  async (
    searchParams: VertexSearchParams,
    currencyCode?: CurrencyCode,
    customerAccessToken?: string,
  ) => {
    const searchClient = getSearchClient();
    const placement = getPlacement();
    const catalogPath = getCatalogPath();

    // Return empty results if Vertex is not configured or no search term
    if (!searchClient || !placement || !catalogPath || !searchParams.term) {
      return {
        products: {
          items: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          collectionInfo: { totalItems: 0 },
        },
        facets: { items: [] },
        attributionToken: undefined,
      };
    }

    const branch = `${catalogPath}/branches/1`;
    const pageSize = searchParams.first || 24;
    const pageToken = searchParams.after || undefined; // Vertex uses pageToken for pagination
    const orderBy = getVertexOrderBy(searchParams.sort);

    try {
      // eslint-disable-next-line no-console
      console.log('[Vertex Full Search] Search params received:', {
        term: searchParams.term,
        category: searchParams.category,
        brand: searchParams.brand,
        color: searchParams.color,
        minPrice: searchParams.minPrice,
        maxPrice: searchParams.maxPrice,
      });

      const filter = buildVertexFilter(searchParams);

      // eslint-disable-next-line no-console
      console.log('[Vertex Full Search] Starting search:', {
        term: searchParams.term,
        pageSize,
        pageToken: pageToken || 'none',
        orderBy: orderBy || 'relevance',
        filter: filter || 'none',
      });

      const startTime = Date.now();

      // Call Vertex Retail Search API with explicit facet specs
      const response = await searchClient.search(
        {
          placement,
          branch,
          query: searchParams.term,
          pageSize,
          pageToken,
          orderBy,
          filter: filter || undefined,
          visitorId: 'catalyst-search', // TODO: unique visitor ID per user
          queryExpansionSpec: {
            condition: 'AUTO',
            pinUnexpandedResults: false,
          },
          // Request specific facets that might be available in the catalog
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          facetSpecs: [
            {
              facetKey: { key: 'brands' },
              limit: 20,
            },
            {
              facetKey: { key: 'categories' },
              limit: 20,
            },
            {
              facetKey: { key: 'colorFamilies' },
              limit: 20,
            },
            {
              facetKey: { key: 'priceInfo.price' },
              limit: 10,
              // intervals is supported by the API but not in TypeScript types
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              intervals: [
                { minimum: 0, maximum: 50 },
                { minimum: 50, maximum: 100 },
                { minimum: 100, maximum: 200 },
                { minimum: 200, maximum: 500 },
                { minimum: 500 },
              ],
            } as any,
          ] as any,
        },
        { autoPaginate: false },
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
      const [searchResults, , fullResponse] = response as any;

      const vertexDuration = Date.now() - startTime;

      // eslint-disable-next-line no-console
      console.log(`[Vertex Full Search] ✓ Search API responded in ${vertexDuration}ms`);
      // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
      console.log('[Vertex Full Search] Results count:', searchResults?.length || 0);
      // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
      console.log('[Vertex Full Search] Total size:', fullResponse?.totalSize || 0);
      // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
      console.log('[Vertex Full Search] Facets:', JSON.stringify(fullResponse?.facets, null, 2));

      // Extract product IDs from search results
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const productIds = searchResults
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        .map((result: any) => extractProductId(result.id || ''))
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        .filter((id: any): id is number => id !== null);

      // eslint-disable-next-line no-console
      console.log('[Vertex Full Search] Extracted product IDs:', productIds);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (productIds.length === 0) {
        // eslint-disable-next-line no-console
        console.log('[Vertex Full Search] ⚠ No product IDs found');

        return {
          products: {
            items: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            collectionInfo: { totalItems: fullResponse?.totalSize || 0 },
          },
          facets: { items: [] },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          attributionToken: fullResponse?.attributionToken,
        };
      }

      // Fetch full product details from BigCommerce
      const bcStartTime = Date.now();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const products = await getProductsByIds(productIds, currencyCode, customerAccessToken);
      const bcDuration = Date.now() - bcStartTime;

      // eslint-disable-next-line no-console
      console.log(`[Vertex Full Search] ✓ BigCommerce API responded in ${bcDuration}ms`);
      // eslint-disable-next-line no-console
      console.log('[Vertex Full Search] Products fetched:', products.length);
      // eslint-disable-next-line no-console
      console.log(`[Vertex Full Search] ✓ Total duration: ${Date.now() - startTime}ms`);

      // Transform Vertex facets to UI format
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unnecessary-condition
      const vertexFacets = (fullResponse.facets as any[]) ?? [];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const transformedFacets = transformVertexFacets(vertexFacets);

      // eslint-disable-next-line no-console
      console.log('[Vertex Full Search] Transformed facets count:', transformedFacets.length);

      // Extract attribution token for search event tracking
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const attributionToken: string | undefined = fullResponse.attributionToken;

      // eslint-disable-next-line no-console
      if (attributionToken) {
        // eslint-disable-next-line no-console
        console.log('[Vertex Full Search] Attribution token present');
      } else {
        // eslint-disable-next-line no-console
        console.warn('[Vertex Full Search] No attribution token in response');
      }

      // Transform to expected format
      return {
        products: {
          items: products,
          pageInfo: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            hasNextPage: !!fullResponse.nextPageToken,
            hasPreviousPage: false, // Vertex doesn't support backward pagination easily
            startCursor: null,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            endCursor: fullResponse.nextPageToken || null,
          },
          collectionInfo: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            totalItems: fullResponse.totalSize || 0,
          },
        },
        facets: {
          items: transformedFacets,
        },
        // Include attribution token for search event tracking
        attributionToken,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Vertex Full Search] ✗ Error:', error);

      // Return empty results on error
      return {
        products: {
          items: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          collectionInfo: { totalItems: 0 },
        },
        facets: { items: [] },
        attributionToken: undefined,
      };
    }
  },
);
