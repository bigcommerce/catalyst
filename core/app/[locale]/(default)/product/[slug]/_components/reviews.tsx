import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations } from 'next-intl/server';
import { createLoader, parseAsString, SearchParams } from 'nuqs/server';
import { cache } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Reviews as ReviewsSection } from '@/vibes/soul/sections/reviews';
import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { defaultPageInfo, pageInfoTransformer } from '~/data-transformers/page-info-transformer';

import { ProductReviewSchemaFragment } from './product-review-schema/fragment';
import { ProductReviewSchema } from './product-review-schema/product-review-schema';

const PaginationSearchParamNames = {
  BEFORE: 'reviews_before',
  AFTER: 'reviews_after',
} as const;

const loadReviewsPaginationSearchParams = createLoader({
  [PaginationSearchParamNames.BEFORE]: parseAsString,
  [PaginationSearchParamNames.AFTER]: parseAsString,
});

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

const getReviews = cache(async (productId: number, paginationArgs: object) => {
  const { data } = await client.fetch({
    document: ReviewsQuery,
    variables: { ...paginationArgs, entityId: productId },
    fetchOptions: { next: { revalidate } },
  });

  return data.site.product;
});

interface Props {
  productId: number;
  searchParams: Promise<SearchParams>;
}

export const Reviews = async ({ productId, searchParams }: Props) => {
  const t = await getTranslations('Product.Reviews');

  const streamableReviewsData = Streamable.from(async () => {
    const paginationSearchParams = await loadReviewsPaginationSearchParams(searchParams);

    const {
      [PaginationSearchParamNames.AFTER]: after,
      [PaginationSearchParamNames.BEFORE]: before,
    } = paginationSearchParams;
    const paginationArgs = before == null ? { first: 5, after } : { last: 5, before };

    return getReviews(productId, paginationArgs);
  });

  const streamableReviews = Streamable.from(async () => {
    const product = await streamableReviewsData;
    const format = await getFormatter();

    if (!product) {
      return [];
    }

    return removeEdgesAndNodes(product.reviews).map((review) => ({
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
  });

  const streamableAvergeRating = Streamable.from(async () => {
    const product = await streamableReviewsData;

    if (!product) {
      return 0;
    }

    return product.reviewSummary.averageRating;
  });

  const streamablePaginationInfo = Streamable.from(async () => {
    const product = await streamableReviewsData;

    return pageInfoTransformer(product?.reviews.pageInfo ?? defaultPageInfo, {
      startCursorParamName: PaginationSearchParamNames.BEFORE,
      endCursorParamName: PaginationSearchParamNames.AFTER,
    });
  });

  return (
    <>
      <ReviewsSection
        averageRating={streamableAvergeRating}
        emptyStateMessage={t('empty')}
        nextLabel={t('next')}
        paginationInfo={streamablePaginationInfo}
        previousLabel={t('previous')}
        reviews={streamableReviews}
        reviewsLabel={t('title')}
      />
      <Stream fallback={null} value={streamableReviewsData}>
        {(product) =>
          product &&
          removeEdgesAndNodes(product.reviews).length > 0 && (
            <ProductReviewSchema
              productId={productId}
              reviews={removeEdgesAndNodes(product.reviews)}
            />
          )
        }
      </Stream>
    </>
  );
};
