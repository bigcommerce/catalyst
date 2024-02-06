import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../generated';

export interface GetProductsArguments {
  productIds: number[];
  first: number;
  imageWidth?: number;
  imageHeight?: number;
}

const GET_PRODUCTS_QUERY = /* GraphQL */ `
  query getProducts($entityIds: [Int!], $first: Int, $imageHeight: Int!, $imageWidth: Int!) {
    site {
      products(entityIds: $entityIds, first: $first) {
        edges {
          node {
            ...ProductDetails
          }
        }
      }
    }
  }
`;

export const getProducts = cache(
  async ({ productIds, first, imageWidth = 300, imageHeight = 300 }: GetProductsArguments) => {
    const query = graphql(GET_PRODUCTS_QUERY);
    const customerId = await getSessionCustomerId();

    const response = await client.fetch({
      document: query,
      variables: { entityIds: productIds, first, imageWidth, imageHeight },
      customerId,
      fetchOptions: {
        cache: customerId ? 'no-store' : 'force-cache',
      },
    });

    const products = removeEdgesAndNodes(response.data.site.products);

    return products.map((product) => ({
      ...product,
      productOptions: removeEdgesAndNodes(product.productOptions),
    }));
  },
);
