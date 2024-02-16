import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../generated';

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

    const revalidate = process.env.NEXT_PUBLIC_DEFAULT_REVALIDATE_TARGET
      ? Number(process.env.NEXT_PUBLIC_DEFAULT_REVALIDATE_TARGET)
      : undefined;

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
