import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations } from 'next-intl/server';
import { cache } from 'react';

import { Stream } from '@/vibes/soul/lib/streamable';
import { Reviews as ReviewsSection } from '@/vibes/soul/sections/reviews';
import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql } from '~/client/graphql';
import { anonymousCachePolicy } from '~/client/cache-policy';
import { defaultPageInfo, pageInfoTransformer } from '~/data-transformers/page-info-transformer';

import { ProductReviewSchemaFragment } from './product-review-schema/fragment';
import { ProductReviewSchema } from './product-review-schema/product-review-schema';

export const PaginationSearchParamNames = {
  BEFORE: 'reviews_before',
  AFTER: 'reviews_after',
} as const;

interface SearchParams {
  [PaginationSearchParamNames.BEFORE]?: string | null;
  [PaginationSearchParamNames.AFTER]?: string | null;
}

const ReviewsQuery = graphql(
  `
    query ReviewsQuery($entityId: Int!, $first: Int, $after: String, $before: String, $last: Int) {
      site {
        product(entityId: $entityId) {
          reviewSummary {
            averageRating
          }
          reviews(first: $first, after: $after, before: $before, last: $last) {
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

const getReviewsData = cache(async (productId: number, searchParams: Promise<SearchParams>) => {
  const { [PaginationSearchParamNames.AFTER]: after, [PaginationSearchParamNames.BEFORE]: before } =
    await searchParams;
  const paginationArgs = before == null ? { first: 5, after } : { last: 5, before };

  const { data } = await client.fetch({
    document: ReviewsQuery,
    variables: { ...paginationArgs, entityId: productId },
    fetchOptions: anonymousCachePolicy,
  });

  return data.site.product;
});

const getReviews = async (productId: number, searchParams: Promise<SearchParams>) => {
  const product = await getReviewsData(productId, searchParams);

  if (!product) {
    return [];
  }

  return removeEdgesAndNodes(product.reviews);
};

const getFormattedReviews = async (productId: number, searchParams: Promise<SearchParams>) => {
  const reviews = await getReviews(productId, searchParams);
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
  const product = await getReviewsData(productId, Promise.resolve({}));

  if (!product) {
    return 0;
  }

  return product.reviewSummary.averageRating;
};

const getPaginationInfo = async (productId: number, searchParams: Promise<SearchParams>) => {
  const product = await getReviewsData(productId, searchParams);

  return pageInfoTransformer(product?.reviews.pageInfo ?? defaultPageInfo, {
    startCursorParamName: PaginationSearchParamNames.BEFORE,
    endCursorParamName: PaginationSearchParamNames.AFTER,
  });
};

interface Props {
  productId: number;
  searchParams: Promise<SearchParams>;
}

export const Reviews = async ({ productId, searchParams }: Props) => {
  const t = await getTranslations('Product.Reviews');

  return (
    <>
      <ReviewsSection
        averageRating={getAverageRating(productId)}
        emptyStateMessage={t('empty')}
        nextLabel={t('Pagination.next')}
        paginationInfo={getPaginationInfo(productId, searchParams)}
        previousLabel={t('Pagination.previous')}
        reviews={getFormattedReviews(productId, searchParams)}
        reviewsLabel={t('title')}
      />
      <Stream fallback={null} value={getReviews(productId, searchParams)}>
        {(reviews) =>
          reviews.length > 0 && <ProductReviewSchema productId={productId} reviews={reviews} />
        }
      </Stream>
    </>
  );
};
