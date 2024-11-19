import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql } from '~/client/graphql';

import { ProductReviewSchemaFragment } from './product-review-schema';

const ReviewsQuery = graphql(
  `
    query ReviewsQuery($entityId: Int!, $first: Int, $last: Int, $after: String, $before: String) {
      site {
        product(entityId: $entityId) {
          reviews(first: $first, after: $after, last: $last, before: $before) {
            pageInfo {
              ...PaginationFragment
            }
            edges {
              node {
                ...ProductReviewSchemaFragment
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
          reviewSummary {
            averageRating
            numberOfReviews
          }
        }
      }
    }
  `,
  [ProductReviewSchemaFragment, PaginationFragment],
);

interface ProductReviewsParams {
  entityId: number;
  limit?: number;
  before?: string;
  after?: string;
}

export const getReviews = cache(
  async ({ entityId, limit = 5, after, before }: ProductReviewsParams) => {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };

    const response = await client.fetch({
      document: ReviewsQuery,
      variables: { entityId, ...paginationArgs },
      customerAccessToken,
      fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate: 300 } },
    });

    return response;
  },
);
