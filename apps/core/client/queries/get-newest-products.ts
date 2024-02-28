import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../generated';
import { revalidate } from '../revalidate-target';

export const GET_NEWEST_PRODUCTS_QUERY = /* GraphQL */ `
  query getNewestProducts($first: Int, $imageHeight: Int!, $imageWidth: Int!) {
    site {
      newestProducts(first: $first) {
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

export const getNewestProducts = cache(
  async ({ first = 12, imageHeight = 300, imageWidth = 300 }: Options = {}) => {
    const query = graphql(GET_NEWEST_PRODUCTS_QUERY);
    const customerId = await getSessionCustomerId();

    const response = await client.fetch({
      document: query,
      variables: { first, imageWidth, imageHeight },
      customerId,
      fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
    });

    const { site } = response.data;

    return removeEdgesAndNodes(site.newestProducts).map((product) => ({
      ...product,
      productOptions: removeEdgesAndNodes(product.productOptions),
    }));
  },
);
