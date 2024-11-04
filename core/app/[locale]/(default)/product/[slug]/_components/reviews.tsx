import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations } from 'next-intl/server';

import { Reviews as ReviewsComponent } from '@/vibes/soul/sections/reviews';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

import { ProductReviewSchema, ProductReviewSchemaFragment } from './product-review-schema';

const ReviewsQuery = graphql(
  `
    query ReviewsQuery($entityId: Int!) {
      site {
        product(entityId: $entityId) {
          reviews(first: 5) {
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
  // TODO: add translations to component
  const t = await getTranslations('Product.Reviews');
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
    <>
      <ReviewsComponent
        averageRating={product.reviewSummary.averageRating}
        reviews={formattedReviews}
      />
      {reviews.length > 0 && <ProductReviewSchema productId={productId} reviews={reviews} />}
    </>
  );
};
