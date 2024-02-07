import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../generated';

export const GET_BEST_SELLING_PRODUCTS_QUERY = /* GraphQL */ `
  query getBestSellingProducts($first: Int, $imageHeight: Int!, $imageWidth: Int!) {
    site {
      bestSellingProducts(first: $first) {
        edges {
          node {
            ...ProductDetails
          }
        }
      }
    }
  }
`;

interface Options {
  first?: number;
  imageWidth?: number;
  imageHeight?: number;
}

export const getBestSellingProducts = cache(
  async ({ first = 12, imageHeight = 300, imageWidth = 300 }: Options = {}) => {
    const query = graphql(GET_BEST_SELLING_PRODUCTS_QUERY);
    const customerId = await getSessionCustomerId();

    const response = await client.fetch({
      document: query,
      variables: { first, imageWidth, imageHeight },
      customerId,
      fetchOptions: {
        cache: customerId ? 'no-store' : 'force-cache',
      },
    });

    const { site } = response.data;

    return removeEdgesAndNodes(site.bestSellingProducts).map((bestSellingProduct) => ({
      ...bestSellingProduct,
      productOptions: removeEdgesAndNodes(bestSellingProduct.productOptions),
    }));
  },
);
