import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client-new';

import { newClient } from '..';
import { graphql } from '../generated';

export const GET_FEATURED_PRODUCTS_QUERY = /* GraphQL */ `
  query getFeaturedProducts($first: Int, $imageHeight: Int!, $imageWidth: Int!) {
    site {
      featuredProducts(first: $first) {
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

export const getFeaturedProducts = async ({
  first = 12,
  imageHeight = 300,
  imageWidth = 300,
}: Options = {}) => {
  const query = graphql(GET_FEATURED_PRODUCTS_QUERY);

  const response = await newClient.fetch({
    document: query,
    variables: { first, imageWidth, imageHeight },
  });

  const { site } = response.data;

  return removeEdgesAndNodes(site.featuredProducts);
};
