import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { PRODUCT_DETAILS_FRAGMENT } from '../fragments/product-details';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';

import { GetProductOptions } from './get-product';

const GET_RELATED_PRODUCTS = graphql(
  `
    query getRelatedProducts($entityId: Int!, $optionValueIds: [OptionValueId!], $first: Int!) {
      site {
        product(entityId: $entityId, optionValueIds: $optionValueIds) {
          relatedProducts(first: $first) {
            edges {
              node {
                ...ProductDetails
              }
            }
          }
        }
      }
    }
  `,
  [PRODUCT_DETAILS_FRAGMENT],
);

export const getRelatedProducts = cache(
  async (
    options: GetProductOptions & {
      first?: number;
    },
  ) => {
    const { productId, optionValueIds, first = 12 } = options;

    const customerId = await getSessionCustomerId();

    const response = await client.fetch({
      document: GET_RELATED_PRODUCTS,
      variables: { entityId: productId, optionValueIds, first },
      fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
    });

    const { product } = response.data.site;

    if (!product) {
      return [];
    }

    return removeEdgesAndNodes(product.relatedProducts).map((relatedProduct) => ({
      ...relatedProduct,
      productOptions: removeEdgesAndNodes(relatedProduct.productOptions),
    }));
  },
);
