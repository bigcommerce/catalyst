import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client-new';

import { newClient } from '..';
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
            description
            availabilityV2 {
              status
            }
            inventory {
              aggregated {
                availableToSell
              }
            }
            reviewSummary {
              averageRating
              numberOfReviews
            }
            productOptions {
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
`;

export const getProducts = async ({
  productIds,
  first,
  imageWidth = 300,
  imageHeight = 300,
}: GetProductsArguments) => {
  const query = graphql(GET_PRODUCTS_QUERY);

  const response = await newClient.fetch({
    document: query,
    variables: { entityIds: productIds, first, imageWidth, imageHeight },
  });

  const products = removeEdgesAndNodes(response.data.site.products);

  return products.map((product) => ({
    ...product,
    productOptions: removeEdgesAndNodes(product.productOptions),
  }));
};
