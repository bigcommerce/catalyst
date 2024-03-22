import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { PRODUCT_DETAILS_FRAGMENT } from '../fragments/product-details';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';

export interface GetProductsArguments {
  productIds: number[];
  first: number;
}

const GET_PRODUCTS_QUERY = graphql(
  `
    query getProducts($entityIds: [Int!], $first: Int) {
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
  `,
  [PRODUCT_DETAILS_FRAGMENT],
);

export const getProducts = cache(async ({ productIds, first }: GetProductsArguments) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: GET_PRODUCTS_QUERY,
    variables: { entityIds: productIds, first },
    customerId,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const products = removeEdgesAndNodes(response.data.site.products);

  return products.map((product) => ({
    ...product,
    productOptions: removeEdgesAndNodes(product.productOptions),
  }));
});
