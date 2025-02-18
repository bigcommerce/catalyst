import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations } from 'next-intl/server';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Reviews as ReviewsSection } from '@/vibes/soul/sections/reviews';
import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
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

interface Props {
  productId: number;
  searchParams: Streamable<SearchParams>;
}

export const Reviews = async ({ productId, searchParams }: Props) => {
  const t = await getTranslations('Product.Reviews');
  const streamableReviewsData = Streamable.from(async () => {
    const {
      [PaginationSearchParamNames.AFTER]: after,
      [PaginationSearchParamNames.BEFORE]: before,
    } = await searchParams;
    const paginationArgs = before == null ? { first: 5, after } : { last: 5, before };

    const { data } = await client.fetch({
      document: ReviewsQuery,
      variables: { ...paginationArgs, entityId: productId },
      fetchOptions: { next: { revalidate } },
    });

    return data.site.product;
  });
  const streamableAverageRating = Streamable.from(async () => {
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
  const streamableReviews = Streamable.from(async () => {
    const product = await streamableReviewsData;
    const reviews = product ? removeEdgesAndNodes(product.reviews) : [];
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
  });

  return (
    <>
      <ReviewsSection
        averageRating={streamableAverageRating}
        emptyStateMessage={t('empty')}
        nextLabel={t('Pagination.next')}
        paginationInfo={streamablePaginationInfo}
        previousLabel={t('Pagination.previous')}
        reviews={streamableReviews}
        reviewsLabel={t('title')}
      />
      <Stream
        fallback={null}
        value={Streamable.from(async () => {
          const product = await streamableReviewsData;

          return product ? removeEdgesAndNodes(product.reviews) : [];
        })}
      >
        {(reviews) =>
          reviews.length > 0 && <ProductReviewSchema productId={productId} reviews={reviews} />
        }
      </Stream>
    </>
  );
};
