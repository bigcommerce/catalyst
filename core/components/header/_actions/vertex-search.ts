'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { SearchResult } from '@/vibes/soul/primitives/navigation';
import { getSessionCustomerAccessToken } from '~/auth';
import { getProductsByIds } from '~/client/queries/get-products-by-ids';
import { searchResultsTransformer } from '~/data-transformers/search-results-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { getCatalogPath, getPlacement, getSearchClient } from '~/lib/vertex-retail/client';

function extractProductIdFromSearch(productId: string): number | null {
  // Vertex AI Search returns product IDs in various formats:
  // - "product-123" (hyphen separator)
  // - "product:123" (colon separator)
  // - "product/123" (slash separator)
  // - "123" (just the numeric ID)
  let id: number | null = null;

  // Pattern 1: "product-ID" or "product:ID" or "product/ID"
  const productMatch = /product[-:/](\d+)/i.exec(productId);

  if (productMatch?.[1]) {
    id = Number.parseInt(productMatch[1], 10);
  }

  // Pattern 2: Just a number
  if (!id && /^\d+$/.test(productId)) {
    id = Number.parseInt(productId, 10);
  }

  return id && !Number.isNaN(id) ? id : null;
}

export async function vertexSearch(
  prevState: {
    lastResult: SubmissionResult | null;
    searchResults: SearchResult[] | null;
    emptyStateTitle?: string;
    emptyStateSubtitle?: string;
  },
  formData: FormData,
): Promise<{
  lastResult: SubmissionResult | null;
  searchResults: SearchResult[] | null;
  emptyStateTitle: string;
  emptyStateSubtitle: string;
}> {
  const t = await getTranslations('Components.Header.Search');
  const submission = parseWithZod(formData, { schema: z.object({ term: z.string() }) });
  const emptyStateTitle = t('noSearchResultsTitle', {
    term: submission.status === 'success' ? submission.value.term : '',
  });
  const emptyStateSubtitle = t('noSearchResultsSubtitle');

  if (submission.status !== 'success') {
    return {
      lastResult: submission.reply(),
      searchResults: prevState.searchResults,
      emptyStateTitle,
      emptyStateSubtitle,
    };
  }

  if (submission.value.term.length < 3) {
    return {
      lastResult: submission.reply(),
      searchResults: null,
      emptyStateTitle,
      emptyStateSubtitle,
    };
  }

  const searchClient = getSearchClient();
  const placement = getPlacement();

  if (!searchClient || !placement) {
    return {
      lastResult: submission.reply({
        formErrors: [t('somethingWentWrong')],
      }),
      searchResults: prevState.searchResults,
      emptyStateTitle,
      emptyStateSubtitle,
    };
  }

  const startTime = Date.now();

  try {
    // eslint-disable-next-line no-console
    console.log('[Vertex Search] Starting search for term:', submission.value.term);
    // eslint-disable-next-line no-console
    console.log('[Vertex Search] Placement:', placement);

    // Build the branch path
    const catalogPath = getCatalogPath();
    const branch = `${catalogPath}/branches/1`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchRequest: any = {
      placement,
      branch,
      query: submission.value.term,
      pageSize: 10,
      visitorId: 'catalyst-search',
      queryExpansionSpec: {
        condition: 'AUTO',
        pinUnexpandedResults: false,
      },
    };

    // eslint-disable-next-line no-console
    console.log('[Vertex Search] Request:', JSON.stringify(searchRequest, null, 2));

    // Call Vertex Retail Search API
    const vertexStartTime = Date.now();
    // The response is a tuple: [results[], request, response]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
    const [searchResults, , fullResponse] = (await searchClient.search(searchRequest, {
      autoPaginate: false,
    })) as any;
    const vertexDuration = Date.now() - vertexStartTime;

    // eslint-disable-next-line no-console
    console.log(`[Vertex Search] ✓ Search API responded in ${vertexDuration}ms`);
    // eslint-disable-next-line no-console
    console.log('[Vertex Search] Search results count:', searchResults.length);
    // eslint-disable-next-line no-console, @typescript-eslint/no-explicit-any
    console.log(
      '[Vertex Search] Result IDs:',
      searchResults.map((r: any) => r.id),
    );
    // eslint-disable-next-line no-console
    console.log('[Vertex Search] Attribution token:', fullResponse.attributionToken || 'none');

    // Extract product IDs from search results
    const vertexResults = searchResults;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productIds = vertexResults
      .map((result: any) => {
        // The product ID can be in two places:
        // 1. result.id (the search result ID, e.g., "product-152")
        // 2. result.product.id (often empty in search results)
        const productId = result.id || result.product?.id;

        // eslint-disable-next-line no-console
        console.log('[Vertex Search] Processing result.id:', result.id, '-> extracted:', productId);

        if (!productId) return null;

        const extractedId = extractProductIdFromSearch(productId);

        // eslint-disable-next-line no-console
        console.log('[Vertex Search] Extracted ID from', productId, ':', extractedId);

        return extractedId;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((id: any): id is number => id !== null);

    // eslint-disable-next-line no-console
    console.log('[Vertex Search] Extracted product IDs:', productIds);

    // If no product IDs found, return empty results
    if (productIds.length === 0) {
      const emptyDuration = Date.now() - startTime;

      // eslint-disable-next-line no-console
      console.log(`[Vertex Search] ⚠ No product IDs found. Total duration: ${emptyDuration}ms`);

      return {
        lastResult: submission.reply(),
        searchResults: [],
        emptyStateTitle,
        emptyStateSubtitle,
      };
    }

    // Fetch product details from BigCommerce using the IDs
    // eslint-disable-next-line no-console
    console.log('[Vertex Search] Fetching product details from BigCommerce...');

    const bcStartTime = Date.now();
    const customerAccessToken = await getSessionCustomerAccessToken();
    const currencyCode = await getPreferredCurrencyCode();

    const products = await getProductsByIds(
      productIds.slice(0, 5), // Limit to first 5 products
      currencyCode,
      customerAccessToken,
    );
    const bcDuration = Date.now() - bcStartTime;

    // eslint-disable-next-line no-console
    console.log(`[Vertex Search] ✓ BigCommerce API responded in ${bcDuration}ms`);
    // eslint-disable-next-line no-console
    console.log('[Vertex Search] Products fetched:', products.length);

    // Transform the products using existing transformer
    const transformedResults = await searchResultsTransformer(products);

    const totalDuration = Date.now() - startTime;

    // eslint-disable-next-line no-console
    console.log(`[Vertex Search] ✓ Search completed successfully in ${totalDuration}ms`);
    // eslint-disable-next-line no-console
    console.log('[Vertex Search] Performance breakdown:', {
      vertexAPI: `${vertexDuration}ms`,
      bigcommerceAPI: `${bcDuration}ms`,
      total: `${totalDuration}ms`,
    });

    return {
      lastResult: submission.reply(),
      searchResults: transformedResults,
      emptyStateTitle,
      emptyStateSubtitle,
    };
  } catch (error) {
    const totalDuration = Date.now() - startTime;

    // eslint-disable-next-line no-console
    console.error(`[Vertex Search] ✗ Error after ${totalDuration}ms:`, error);

    if (error instanceof Error) {
      return {
        lastResult: submission.reply({ formErrors: [error.message] }),
        searchResults: prevState.searchResults,
        emptyStateTitle,
        emptyStateSubtitle,
      };
    }

    return {
      lastResult: submission.reply({
        formErrors: [t('somethingWentWrong')],
      }),
      searchResults: prevState.searchResults,
      emptyStateTitle,
      emptyStateSubtitle,
    };
  }
}
