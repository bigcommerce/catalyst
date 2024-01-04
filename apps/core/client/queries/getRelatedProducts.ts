import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client-new';

import { newClient } from '..';
import { graphql } from '../generated';

import { GetProductOptions } from './getProduct';

export const GET_RELATED_PRODUCTS = /* GraphQL */ `
  query getRelatedProducts(
    $entityId: Int!
    $optionValueIds: [OptionValueId!]
    $first: Int!
    $imageHeight: Int!
    $imageWidth: Int!
  ) {
    site {
      product(entityId: $entityId, optionValueIds: $optionValueIds) {
        relatedProducts(first: $first) {
          edges {
            node {
              ...ProductDetails
              reviewSummary {
                summationOfRatings
                numberOfReviews
                averageRating
              }
              productOptions(first: 3) {
                edges {
                  node {
                    entityId
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const getRelatedProducts = async (
  options: GetProductOptions & {
    first?: number;
    imageWidth?: number;
    imageHeight?: number;
  },
) => {
  const { productId, optionValueIds, first = 12, imageWidth = 300, imageHeight = 300 } = options;

  const query = graphql(GET_RELATED_PRODUCTS);

  const response = await newClient.fetch({
    document: query,
    variables: { entityId: productId, optionValueIds, first, imageWidth, imageHeight },
  });

  const { product } = response.data.site;

  if (!product) {
    return [];
  }

  return removeEdgesAndNodes(product.relatedProducts).map((relatedProduct) => ({
    ...relatedProduct,
    productOptions: removeEdgesAndNodes(relatedProduct.productOptions),
  }));
};
