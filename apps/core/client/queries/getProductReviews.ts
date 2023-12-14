import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client-new';

import { newClient } from '..';
import { graphql } from '../generated';

const GET_PRODUCT_REVIEWS_QUERY = /* GraphQL */ `
  query getProductReviews($entityId: Int!) {
    site {
      product(entityId: $entityId) {
        reviewSummary {
          summationOfRatings
          numberOfReviews
          averageRating
        }
        reviews(first: 5) {
          edges {
            node {
              author {
                name
              }
              entityId
              title
              text
              rating
              createdAt {
                utc
              }
            }
          }
        }
      }
    }
  }
`;

export const getProductReviews = async (entityId: number) => {
  const query = graphql(GET_PRODUCT_REVIEWS_QUERY);

  const response = await newClient.fetch({
    document: query,
    variables: { entityId },
  });

  const { product } = response.data.site;

  if (!product) {
    return null;
  }

  return {
    reviewSummary: product.reviewSummary,
    reviews: removeEdgesAndNodes(product.reviews),
  };
};
