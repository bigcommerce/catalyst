import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useTranslations } from 'next-intl';
import { getFormatter, getTranslations } from 'next-intl/server';
import { cache } from 'react';

import { Stream } from '@/vibes/soul/lib/streamable';
import { Reviews as ReviewsSection } from '@/vibes/soul/sections/reviews';
import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

import { ProductReviewSchemaFragment } from './product-review-schema/fragment';
import { ProductReviewSchema } from './product-review-schema/product-review-schema';

const ReviewsQuery = graphql(
  `
    query ReviewsQuery($entityId: Int!) {
      site {
        product(entityId: $entityId) {
          reviewSummary {
            averageRating
          }
          reviews(first: 5) {
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
        }
      }
    }
  `,
  [ProductReviewSchemaFragment, PaginationFragment],
);

const getReviewsData = cache(async (productId: number) => {
  const { data } = await client.fetch({
    document: ReviewsQuery,
    variables: { entityId: productId },
    fetchOptions: { next: { revalidate } },
  });

  return data.site.product;
});

const getReviews = async (productId: number) => {
  const product = await getReviewsData(productId);

  if (!product) {
    return [];
  }

  return removeEdgesAndNodes(product.reviews);
};

const getFormattedReviews = async (productId: number) => {
  const reviews = await getReviews(productId);
  const format = await getFormatter();

  return reviews.map((review) => ({
    id: review.entityId.toString(),
    rating: review.rating,
    review: review.text,
    name: review.author.name,
    date: format.dateTime(new Date(review.createdAt.utc), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  }));
};

const getAverageRating = async (productId: number) => {
  const product = await getReviewsData(productId);

  if (!product) {
    return 0;
  }

  return product.reviewSummary.averageRating;
};

const getPaginationInfo = async (productId: number) => {
  const t = await getTranslations('Product.Reviews.Pagination');
  const product = await getReviewsData(productId);

  if (!product) {
    return {};
  }

  const { hasNextPage, hasPreviousPage, endCursor, startCursor } = product.reviews.pageInfo;

  return hasNextPage || hasPreviousPage
    ? {
        startCursorParamName: 'before',
        endCursorParamName: 'after',
        endCursor: hasNextPage ? endCursor : null,
        startCursor: hasPreviousPage ? startCursor : null,
        nextLabel: t('next'),
        previousLabel: t('previous'),
      }
    : {};
};

interface Props {
  productId: number;
}

export const Reviews = ({ productId }: Props) => {
  const t = useTranslations('Product.Reviews');

  return (
    <>
      <ReviewsSection
        averageRating={getAverageRating(productId)}
        emptyStateMessage={t('empty')}
        paginationInfo={getPaginationInfo(productId)}
        reviews={getFormattedReviews(productId)}
        reviewsLabel={t('heading')}
      />
      <Stream fallback={null} value={getReviews(productId)}>
        {(reviews) =>
          reviews.length > 0 && <ProductReviewSchema productId={productId} reviews={reviews} />
        }
      </Stream>
    </>
  );
};
