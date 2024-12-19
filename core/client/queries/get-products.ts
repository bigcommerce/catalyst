'use server';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, ResultOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { ProductCardFragment } from '~/components/product-card/fragment';

const GetBestSellingProductsQuery = graphql(
  `
    query getBestSellingProducts {
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
    query getFeaturedProducts {
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
    query getNewestProducts {
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
    query GetProductsByIds($entityIds: [Int!]) {
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

const getBestSellingProducts = cache(async () => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    const response = await client.fetch({
      document: GetBestSellingProductsQuery,
      customerAccessToken,
      fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
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

const getFeaturedProducts = cache(async () => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    const response = await client.fetch({
      document: GetFeaturedProductsQuery,
      customerAccessToken,
      fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
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

const getNewestProducts = cache(async () => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    const response = await client.fetch({
      document: GetNewestProductsQuery,
      customerAccessToken,
      fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
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

const getProductsByIds = cache(async (entityIds: number[]) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    const response = await client.fetch({
      document: GetProductsByIds,
      variables: { entityIds },
      customerAccessToken,
      fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
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
});

export { getBestSellingProducts, getFeaturedProducts, getNewestProducts, getProductsByIds };
