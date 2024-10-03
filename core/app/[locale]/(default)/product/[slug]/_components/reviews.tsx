import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter } from 'next-intl/server';

import { Reviews as ReviewsComponent } from '@/vibes/soul/components/reviews';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

import { ProductReviewSchemaFragment } from './product-review-schema';

const ReviewsQuery = graphql(
  `
    query ReviewsQuery($entityId: Int!) {
      site {
        product(entityId: $entityId) {
          reviews(first: 5) {
            edges {
              node {
                entityId
                ...ProductReviewSchemaFragment
              }
            }
          }
          reviewSummary {
            averageRating
          }
        }
      }
    }
  `,
  [ProductReviewSchemaFragment],
);

interface Props {
  productId: number;
}

export const Reviews = async ({ productId }: Props) => {
  const format = await getFormatter();

  const { data } = await client.fetch({
    document: ReviewsQuery,
    variables: { entityId: productId },
    fetchOptions: { next: { revalidate } },
  });

  const product = data.site.product;

  if (!product) {
    return null;
  }

  const reviews = removeEdgesAndNodes(product.reviews);

  const formattedReviews = reviews.map((review) => ({
    id: review.entityId.toString(),
    review: review.text,
    name: review.author.name,
    date: format.dateTime(new Date(review.createdAt.utc), {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
  }));

  return (
    <ReviewsComponent
      averageRating={product.reviewSummary.averageRating}
      reviews={formattedReviews}
    />
  );
};
