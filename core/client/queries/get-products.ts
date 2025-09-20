import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { graphql, ResultOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { ProductCardFragment } from '~/components/product-card/fragment';
import { getPreferredCurrencyCode } from '~/lib/currency';

const GetBestSellingProductsQuery = graphql(
  `
    query getBestSellingProducts($currencyCode: currencyCode) {
      site {
        bestSellingProducts {
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
  `,
  [ProductCardFragment],
);

const GetFeaturedProductsQuery = graphql(
  `
    query getFeaturedProducts($currencyCode: currencyCode) {
      site {
        featuredProducts {
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
  `,
  [ProductCardFragment],
);

const GetNewestProductsQuery = graphql(
  `
    query getNewestProducts($currencyCode: currencyCode) {
      site {
        newestProducts {
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
  `,
  [ProductCardFragment],
);

const GetProductsByIds = graphql(
  `
    query GetProductsByIds($entityIds: [Int!], $currencyCode: currencyCode) {
      site {
        products(entityIds: $entityIds) {
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
  `,
  [ProductCardFragment],
);

export type GetProductsResponse = Array<
  NonNullable<
    ResultOf<typeof GetBestSellingProductsQuery>['site']['bestSellingProducts']['edges']
  >[number]['node']
>;

const getBestSellingProducts = cache(async ({ locale }: { locale?: string }) => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();
  const channelId = getChannelIdFromLocale(locale);

  try {
    const response = await client.fetch({
      document: GetBestSellingProductsQuery,
      customerAccessToken,
      variables: { currencyCode },
      channelId,
      fetchOptions: {
        ...(locale && { headers: { 'Accept-Language': locale } }),
        ...(customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } }),
      },
    });

    const { bestSellingProducts } = response.data.site;

    return {
      status: 'success',
      products: removeEdgesAndNodes(bestSellingProducts),
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error', error: 'Something went wrong. Please try again.' };
  }
});

const getFeaturedProducts = cache(async ({ locale }: { locale?: string }) => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();
  const channelId = getChannelIdFromLocale(locale);

  try {
    const response = await client.fetch({
      document: GetFeaturedProductsQuery,
      customerAccessToken,
      variables: { currencyCode },
      channelId,
      fetchOptions: {
        ...(locale && { headers: { 'Accept-Language': locale } }),
        ...(customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } }),
      },
    });

    const { featuredProducts } = response.data.site;

    return {
      status: 'success',
      products: removeEdgesAndNodes(featuredProducts),
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error', error: 'Something went wrong. Please try again.' };
  }
});

const getNewestProducts = cache(async ({ locale }: { locale?: string }) => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();
  const channelId = getChannelIdFromLocale(locale);

  try {
    const response = await client.fetch({
      document: GetNewestProductsQuery,
      customerAccessToken,
      variables: { currencyCode },
      channelId,
      fetchOptions: {
        ...(locale && { headers: { 'Accept-Language': locale } }),
        ...(customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } }),
      },
    });

    const { newestProducts } = response.data.site;

    return {
      status: 'success',
      products: removeEdgesAndNodes(newestProducts),
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error', error: 'Something went wrong. Please try again.' };
  }
});

const getProductsByIds = cache(
  async ({ entityIds, locale }: { entityIds: number[]; locale?: string }) => {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const currencyCode = await getPreferredCurrencyCode();

    try {
      const response = await client.fetch({
        document: GetProductsByIds,
        variables: { entityIds, currencyCode },
        customerAccessToken,
        fetchOptions: {
          ...(locale && { headers: { 'Accept-Language': locale } }),
          ...(customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } }),
        },
      });

      const { products } = response.data.site;

      return {
        status: 'success',
        products: removeEdgesAndNodes(products),
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { status: 'error', error: error.message };
      }

      return { status: 'error', error: 'Something went wrong. Please try again.' };
    }
  },
);

export { getBestSellingProducts, getFeaturedProducts, getNewestProducts, getProductsByIds };
