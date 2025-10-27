import { cache } from 'react';

import { getProductsByIds } from '~/client/queries/get-products-by-ids';
import { CurrencyCode } from '~/components/header/fragment';
import { getCatalogPath, getPlacement, getSearchClient } from '~/lib/vertex-retail/client';

import { transformVertexFacets } from './vertex-facets-transformer';

interface VertexBrowseParams {
  after?: string; // pageToken for next page
  before?: string; // pageToken for prev page (not well supported by Vertex)
  first?: number; // page size
  sort?: string; // sort option
  // Filter parameters
  brand?: string | string[];
  color?: string | string[];
  minPrice?: string;
  maxPrice?: string;
  // Allow any other filter parameters
  [key: string]: unknown;
}

/**
 * Map Catalyst sort options to Vertex AI orderBy parameter
 * @param {string} [sort] - Sort option
 * @returns {string} Vertex orderBy string
 */
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
 * @param {string} fieldName - Vertex field name (e.g., 'brands', 'colorFamilies')
 * @returns {string} Filter string or empty string if no values
 */
function buildFilterClause(values: string[], fieldName: string): string {
  if (values.length === 0) return '';

  const filters = values.map((value) => `${fieldName}: ANY("${value}")`);

  return filters.length === 1 ? (filters[0] ?? '') : `(${filters.join(' OR ')})`;
}

/**
 * Build Vertex filter string from browse params (excluding main category/brand)
 * @param {VertexBrowseParams} params - Browse parameters including filter values
 * @returns {string} Vertex filter string
 */
function buildAdditionalFilters(params: VertexBrowseParams): string {
  const filters: string[] = [];

  // Brand filter (for additional brand filters when browsing categories)
  if (params.brand) {
    const brandFilter = buildFilterClause(normalizeFilterValues(params.brand), 'brands');

    if (brandFilter.length > 0) {
      filters.push(brandFilter);
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

/**
 * Extract product data from Vertex search result for immediate rendering
 * @param {any} searchResult - Vertex search result
 * @returns {object | null} Preliminary product data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractVertexProductData(searchResult: any) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (!searchResult?.product || !searchResult.id) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const product = searchResult.product;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const productId = extractProductId(searchResult.id);

  if (!productId) {
    return null;
  }

  return {
    id: productId,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    title: product.title || 'Loading...',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    image: product.images?.[0]
      ? {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          src: product.images[0].uri || product.images[0].url,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          alt: product.images[0].alt || product.title,
        }
      : undefined,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    href: product.uri || '#',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    brand: product.brands?.[0] || undefined,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    priceInfo: product.priceInfo || undefined,
  };
}

/**
 * Extract BigCommerce product ID from Vertex search result ID
 * Supports formats: product-123, product:123, product/123, 123
 * @param {string} vertexId - Vertex product ID
 * @returns {number | null} Extracted product ID
 */
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
 * Browse products by category using Vertex AI Search API
 * Filters by category name using the 'categories' field
 * @param {number} categoryEntityId - Category entity ID (e.g., 23) - used for logging only
 * @param {VertexBrowseParams} browseParams - Browse parameters
 * @param {string} pageCategory - Category name from BigCommerce (e.g., "Sales-Clearance")
 * @param {CurrencyCode} [currencyCode] - Currency code
 * @param {string} [customerAccessToken] - Customer access token
 * @returns {Promise} Products and facets
 */
export const fetchVertexBrowseByCategory = cache(
  async (
    categoryEntityId: number,
    browseParams: VertexBrowseParams = {},
    pageCategory: string,
    currencyCode?: CurrencyCode,
    customerAccessToken?: string,
  ) => {
    const searchClient = getSearchClient();
    const placement = getPlacement();
    const catalogPath = getCatalogPath();

    // Return empty results if Vertex is not configured
    if (!searchClient || !placement || !catalogPath) {
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
      };
    }

    const branch = `${catalogPath}/branches/1`;
    const pageSize = browseParams.first || 24;
    const pageToken = browseParams.after || undefined;
    const orderBy = getVertexOrderBy(browseParams.sort);
    const additionalFilters = buildAdditionalFilters(browseParams);

    // Build category filter using the category name
    // The 'categories' field is a top-level array field, so we can filter directly without 'attributes.' prefix
    // This requires pageCategory to be provided from BigCommerce
    if (!pageCategory) {
      throw new Error('pageCategory is required for category browse with Vertex AI');
    }

    const categoryFilter = `categories: ANY("${pageCategory}")`;
    const combinedFilter =
      additionalFilters.length > 0 ? `${categoryFilter} AND ${additionalFilters}` : categoryFilter;

    try {
      // eslint-disable-next-line no-console
      console.log('[Vertex Category Browse] Starting browse:', {
        categoryEntityId,
        pageCategory: pageCategory || 'not provided',
        pageSize,
        pageToken: pageToken || 'none',
        orderBy: orderBy || 'relevance',
        filter: combinedFilter,
      });

      const startTime = Date.now();

      // Call Vertex Retail Search API with filter for category browsing
      const response = await searchClient.search(
        {
          placement,
          branch,
          query: '', // Empty query for browse mode
          filter: combinedFilter, // Use categoryEntityId filter
          pageSize,
          pageToken,
          orderBy,
          visitorId: 'catalyst-browse', // TODO: unique visitor ID per user
          // Include page category for browse analytics and improved recommendations
          ...(pageCategory && { pageCategories: [pageCategory] }),
          // Request facets with dynamic positioning enabled
          // Note: Dynamic faceting must be enabled in the serving config
          facetSpecs: [
            {
              facetKey: { key: 'brands' },
              limit: 20,
              enableDynamicPosition: true,
            },
            {
              facetKey: { key: 'colorFamilies' },
              limit: 20,
              enableDynamicPosition: true,
            },
            {
              facetKey: { key: 'categories' },
              limit: 20,
              enableDynamicPosition: true,
            },
            {
              facetKey: { key: 'priceInfo.price' },
              limit: 10,
              enableDynamicPosition: true,
              // intervals is supported by the API
              intervals: [
                { minimum: 0, maximum: 50 },
                { minimum: 50, maximum: 100 },
                { minimum: 100, maximum: 200 },
                { minimum: 200, maximum: 500 },
                { minimum: 500 },
              ],
            },
            // Request additional dynamic facets based on catalog attributes
            {
              facetKey: { key: 'sizes' },
              limit: 15,
              enableDynamicPosition: true,
            },
            {
              facetKey: { key: 'materials' },
              limit: 15,
              enableDynamicPosition: true,
            },
            {
              facetKey: { key: 'patterns' },
              limit: 15,
              enableDynamicPosition: true,
            },
          ],
        },
        { autoPaginate: false },
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
      const [searchResults, , fullResponse] = response as any;

      const vertexDuration = Date.now() - startTime;

      // eslint-disable-next-line no-console
      console.log(`[Vertex Category Browse] ✓ Vertex API responded in ${vertexDuration}ms`);
      // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
      console.log('[Vertex Category Browse] Results count:', searchResults?.length || 0);
      // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
      console.log('[Vertex Category Browse] Total size:', fullResponse?.totalSize || 0);
      // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
      console.log('[Vertex Category Browse] Facets:', fullResponse?.facets?.length || 0);

      // Log first result for debugging
      // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
      if (searchResults?.length > 0) {
        // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
        console.log('[Vertex Category Browse] First result ID:', searchResults[0]?.id);
      }

      // Extract product IDs from search results
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const productIds = searchResults
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        .map((result: any) => extractProductId(result.id || ''))
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        .filter((id: any): id is number => id !== null);

      // Extract preliminary product data from Vertex for immediate rendering
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const vertexProducts = searchResults
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((result: any) => extractVertexProductData(result))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((product: any) => product !== null);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (productIds.length === 0) {
        // eslint-disable-next-line no-console
        console.log('[Vertex Category Browse] ⚠ No product IDs found');

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
        };
      }

      // Fetch full product details from BigCommerce
      const bcStartTime = Date.now();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const products = await getProductsByIds(productIds, currencyCode, customerAccessToken);
      const bcDuration = Date.now() - bcStartTime;

      // eslint-disable-next-line no-console
      console.log(`[Vertex Category Browse] ✓ BigCommerce API responded in ${bcDuration}ms`);

      // Transform Vertex facets to UI format
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unnecessary-condition
      const vertexFacets = (fullResponse.facets as any[]) ?? [];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const transformedFacets = transformVertexFacets(vertexFacets);

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        vertexProducts, // Preliminary product data for immediate rendering
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Vertex Category Browse] ✗ Error:', error);

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
      };
    }
  },
);

/**
 * Browse products by brand using Vertex AI Search API
 * Filters by brandEntityId custom attribute
 * @param {number} brandEntityId - Brand entity ID (e.g., 40)
 * @param {VertexBrowseParams} browseParams - Browse parameters
 * @param {CurrencyCode} [currencyCode] - Currency code
 * @param {string} [customerAccessToken] - Customer access token
 * @returns {Promise} Products and facets
 */
export const fetchVertexBrowseByBrand = cache(
  async (
    brandEntityId: number,
    browseParams: VertexBrowseParams = {},
    currencyCode?: CurrencyCode,
    customerAccessToken?: string,
  ) => {
    const searchClient = getSearchClient();
    const placement = getPlacement();
    const catalogPath = getCatalogPath();

    // Return empty results if Vertex is not configured
    if (!searchClient || !placement || !catalogPath) {
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
      };
    }

    const branch = `${catalogPath}/branches/1`;
    const pageSize = browseParams.first || 24;
    const pageToken = browseParams.after || undefined;
    const orderBy = getVertexOrderBy(browseParams.sort);
    const additionalFilters = buildAdditionalFilters(browseParams);

    // Build brand filter
    // For custom text attributes stored as arrays, we need to check if the array contains the value
    // Note: brandEntityId is a custom attribute, so we need to prefix it with "attributes."
    const brandFilter = `attributes.brandEntityId: ANY("${brandEntityId}")`;
    const combinedFilter =
      additionalFilters.length > 0 ? `${brandFilter} AND ${additionalFilters}` : brandFilter;

    try {
      // eslint-disable-next-line no-console
      console.log('[Vertex Brand Browse] Starting browse:', {
        brandEntityId,
        pageSize,
        pageToken: pageToken || 'none',
        orderBy: orderBy || 'relevance',
        filter: combinedFilter,
      });

      const startTime = Date.now();

      // Call Vertex Retail Search API with filter for brand browsing
      const response = await searchClient.search(
        {
          placement,
          branch,
          query: '', // Empty query for browse mode
          filter: combinedFilter, // Use brand filter for browsing
          pageSize,
          pageToken,
          orderBy,
          visitorId: 'catalyst-browse', // TODO: unique visitor ID per user
          // Request facets with dynamic positioning (excluding brands since we're filtering by brand)
          // Note: Dynamic faceting must be enabled in the serving config
          facetSpecs: [
            {
              facetKey: { key: 'categories' },
              limit: 20,
              enableDynamicPosition: true,
            },
            {
              facetKey: { key: 'colorFamilies' },
              limit: 20,
              enableDynamicPosition: true,
            },
            {
              facetKey: { key: 'priceInfo.price' },
              limit: 10,
              enableDynamicPosition: true,
              // intervals is supported by the API
              intervals: [
                { minimum: 0, maximum: 50 },
                { minimum: 50, maximum: 100 },
                { minimum: 100, maximum: 200 },
                { minimum: 200, maximum: 500 },
                { minimum: 500 },
              ],
            },
            // Request additional dynamic facets
            {
              facetKey: { key: 'sizes' },
              limit: 15,
              enableDynamicPosition: true,
            },
            {
              facetKey: { key: 'materials' },
              limit: 15,
              enableDynamicPosition: true,
            },
            {
              facetKey: { key: 'patterns' },
              limit: 15,
              enableDynamicPosition: true,
            },
          ],
        },
        { autoPaginate: false },
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
      const [searchResults, , fullResponse] = response as any;

      const vertexDuration = Date.now() - startTime;

      // eslint-disable-next-line no-console
      console.log(`[Vertex Brand Browse] ✓ Vertex API responded in ${vertexDuration}ms`);
      // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
      console.log('[Vertex Brand Browse] Results count:', searchResults?.length || 0);
      // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
      console.log('[Vertex Brand Browse] Total size:', fullResponse?.totalSize || 0);
      // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
      console.log('[Vertex Brand Browse] Facets:', fullResponse?.facets?.length || 0);

      // Log first result for debugging
      // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
      if (searchResults?.length > 0) {
        // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
        console.log('[Vertex Brand Browse] First result ID:', searchResults[0]?.id);
      }

      // Extract product IDs from search results
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const productIds = searchResults
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        .map((result: any) => extractProductId(result.id || ''))
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        .filter((id: any): id is number => id !== null);

      // Extract preliminary product data from Vertex for immediate rendering
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const vertexProducts = searchResults
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((result: any) => extractVertexProductData(result))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((product: any) => product !== null);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (productIds.length === 0) {
        // eslint-disable-next-line no-console
        console.log('[Vertex Brand Browse] ⚠ No product IDs found');
        // eslint-disable-next-line no-console
        console.log('[Vertex Brand Browse] ⚠ This likely means the brandEntityId attribute is not indexed');
        // eslint-disable-next-line no-console
        console.log('[Vertex Brand Browse] ⚠ Check that products have attributes.brandEntityId set in Vertex');

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
        };
      }

      // Fetch full product details from BigCommerce
      const bcStartTime = Date.now();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const products = await getProductsByIds(productIds, currencyCode, customerAccessToken);
      const bcDuration = Date.now() - bcStartTime;

      // eslint-disable-next-line no-console
      console.log(`[Vertex Brand Browse] ✓ BigCommerce API responded in ${bcDuration}ms`);

      // Transform Vertex facets to UI format
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unnecessary-condition
      const vertexFacets = (fullResponse.facets as any[]) ?? [];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const transformedFacets = transformVertexFacets(vertexFacets);

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        vertexProducts, // Preliminary product data for immediate rendering
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Vertex Brand Browse] ✗ Error:', error);

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
      };
    }
  },
);
