import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { ProductCardFragment } from '~/components/product-card/fragment';
import axios from 'axios';

// ###################################################### PRODUCTS ######################################################

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
                  categories {
                    edges {
                      node {
                        name
                        path
                      }
                    }
                  }
                  ...ProductCardFragment
                }
              }
            }
          }
        }
      }
    }
  `,
  [ProductCardFragment],
);

export const getSearchResults = cache(async (searchTerm: string) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    const response = await client.fetch({
      document: GetQuickSearchResultsQuery,
      variables: { filters: { searchTerm } },
      customerAccessToken,
      fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
    });

    const { products } = response.data.site.search.searchProducts;

    return {
      status: 'success',
      data: {
        products: removeEdgesAndNodes(products),
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error', error: 'Something went wrong. Please try again.' };
  }
});

// ###################################################### CATEGORIES ######################################################

interface CategorySearchResponse {
  status: 'success' | 'error';
  data?: {
    categories: {
      category_id: number;
      name: string;
      description: string;
      image_url: string;
      url: {
        path: string;
      };
    }[];
  };
  error?: string;
}

export const getCategorySearchResults = cache(
  async (searchTerm: string): Promise<CategorySearchResponse> => {
    try {
      const response = await axios.get(
        `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/catalog/trees/categories?name:like=${searchTerm}`,
        {
          headers: {
            'X-Auth-Token': process.env.BIGCOMMERCE_API_ACCESS_TOKEN ?? '',
            'Content-Type': 'application/json',
          },
        },
      );

      const { data } = response.data;

      return {
        status: 'success',
        data: {
          categories: data,
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { status: 'error', error: error.message };
      }

      return { status: 'error', error: 'Something went wrong. Please try again.' };
    }
  },
);
