import DOMPurify from 'isomorphic-dompurify';
import { useFormatter } from 'next-intl';
import { Product as ProductSchemaType, WithContext } from 'schema-dts';

import { FragmentOf } from '~/client/graphql';

import { ProductReviewSchemaFragment } from './fragment';

interface Props {
  productId: number;
  reviews: Array<FragmentOf<typeof ProductReviewSchemaFragment>>;
}

export const ProductReviewSchema = ({ reviews, productId }: Props) => {
  const format = useFormatter();

  const productReviewSchema: WithContext<ProductSchemaType> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `product-${productId}`,
    review: reviews.map((review) => {
      return {
        '@type': 'Review' as const,
        datePublished: format.dateTime(new Date(review.createdAt.utc)),
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
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(JSON.stringify(productReviewSchema)) }}
      type="application/ld+json"
    />
  );
};
