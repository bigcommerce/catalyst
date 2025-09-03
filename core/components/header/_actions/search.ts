'use server';

import { BigCommerceGQLError, removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { SearchResult } from '@/vibes/soul/primitives/navigation';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { searchResultsTransformer } from '~/data-transformers/search-results-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { withGraphQLSpan, addSpanAttributes } from '~/lib/otel';

import { SearchProductFragment } from './fragment';

const GetQuickSearchResultsQuery = graphql(
  `
    query getQuickSearchResults(
      $filters: SearchProductsFiltersInput!
      $currencyCode: currencyCode
    ) {
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

  const customerAccessToken = await getSessionCustomerAccessToken();

  const currencyCode = await getPreferredCurrencyCode();

  try {
    // Add search term to span attributes
    addSpanAttributes({
      'search.term': submission.value.term,
      'search.term.length': submission.value.term.length,
      'user.authenticated': !!customerAccessToken,
    });

    const response = await withGraphQLSpan('getQuickSearchResults', async () => {
      return await client.fetch({
        document: GetQuickSearchResultsQuery,
        variables: { filters: { searchTerm: submission.value.term }, currencyCode },
        customerAccessToken,
        fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
      });
    });

    const { products } = response.data.site.search.searchProducts;

    // Add result count to span attributes
    addSpanAttributes({
      'search.results.count': products.edges.length,
    });

    return {
      lastResult: submission.reply(),
      searchResults: await searchResultsTransformer(removeEdgesAndNodes(products)),
      emptyStateTitle,
      emptyStateSubtitle,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return {
        lastResult: submission.reply({
          formErrors: error.errors.map(({ message }) => message),
        }),
        searchResults: prevState.searchResults,
        emptyStateTitle,
        emptyStateSubtitle,
      };
    }

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
