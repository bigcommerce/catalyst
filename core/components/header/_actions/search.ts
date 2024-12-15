'use server';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { z } from 'zod';

import { SearchResult } from '@/vibes/soul/primitives/navigation';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { searchResultsTransformer } from '~/data-transformers/search-results-transformer';

import { SearchProductFragment } from './fragment';

const GetQuickSearchResultsQuery = graphql(
  `
    query getQuickSearchResults($filters: SearchProductsFiltersInput!) {
      site {
        search {
          searchProducts(filters: $filters) {
            products(first: 5) {
              edges {
                node {
                  ...SearchProductFragment
                }
              }
            }
          }
        }
      }
    }
  `,
  [SearchProductFragment],
);

export async function search(
  lastResult: {
    lastResult: SubmissionResult | null;
    searchResults: SearchResult[] | null;
  },
  formData: FormData,
): Promise<{ lastResult: SubmissionResult | null; searchResults: SearchResult[] | null }> {
  const submission = parseWithZod(formData, { schema: z.object({ q: z.string() }) });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply(), searchResults: lastResult.searchResults };
  }

  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    const response = await client.fetch({
      document: GetQuickSearchResultsQuery,
      variables: { filters: { searchTerm: submission.value.q } },
      customerAccessToken,
      fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
    });

    const { products } = response.data.site.search.searchProducts;

    return {
      lastResult: submission.reply(),
      searchResults: await searchResultsTransformer(removeEdgesAndNodes(products)),
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        lastResult: submission.reply({ formErrors: [error.message] }),
        searchResults: lastResult.searchResults,
      };
    }

    return {
      lastResult: submission.reply({
        formErrors: ['Something went wrong. Please try again.'],
      }),
      searchResults: lastResult.searchResults,
    };
  }
}
