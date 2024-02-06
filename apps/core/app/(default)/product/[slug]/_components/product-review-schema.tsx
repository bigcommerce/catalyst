import { Product as ProductSchemaType, WithContext } from 'schema-dts';

import { getProductReviews } from '~/client/queries/get-product-reviews';
import { ExistingResultType } from '~/client/util';

export const ProductReviewSchema = ({
  reviews,
  productId,
}: {
  reviews: ExistingResultType<typeof getProductReviews>['reviews'];
  productId: number;
}) => {
  const productReviewSchema: WithContext<ProductSchemaType> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `product-${productId}`,
    review: reviews.map((review) => {
      return {
        '@type': 'Review' as const,
        datePublished: new Intl.DateTimeFormat('en-US').format(new Date(review.createdAt.utc)),
        name: review.title,
        reviewBody: review.text,
        author: {
          '@type': 'Person' as const,
          name: review.author.name,
        },
        reviewRating: {
          '@type': 'Rating' as const,
          bestRating: 5,
          ratingValue: review.rating,
          worstRating: 1,
        },
      };
    }),
  };

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productReviewSchema) }}
      type="application/ld+json"
    />
  );
};
