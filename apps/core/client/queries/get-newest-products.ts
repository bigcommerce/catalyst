import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { PRODUCT_DETAILS_FRAGMENT } from '../fragments/product-details';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';

const GET_NEWEST_PRODUCTS_QUERY = graphql(
  `
    query getNewestProducts($first: Int) {
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
  `,
  [PRODUCT_DETAILS_FRAGMENT],
);

interface Options {
  first?: number;
}

export const getNewestProducts = cache(async ({ first = 12 }: Options = {}) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: GET_NEWEST_PRODUCTS_QUERY,
    variables: { first },
    customerId,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const { site } = response.data;

  return removeEdgesAndNodes(site.newestProducts).map((product) => ({
    ...product,
    productOptions: removeEdgesAndNodes(product.productOptions),
  }));
});
