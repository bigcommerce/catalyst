import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { client } from '..';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';

const GET_PRODUCT_REVIEWS_QUERY = graphql(`
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
`);

export const getProductReviews = cache(async (entityId: number) => {
  const response = await client.fetch({
    document: GET_PRODUCT_REVIEWS_QUERY,
    variables: { entityId },
    fetchOptions: { next: { revalidate } },
  });

  const { product } = response.data.site;

  if (!product) {
    return null;
  }

  return {
    reviewSummary: product.reviewSummary,
    reviews: removeEdgesAndNodes(product.reviews),
  };
});
