import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations } from 'next-intl/server';
import { cache } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { ReviewsWithForm } from '@/vibes/soul/sections/reviews/reviews-with-form';
import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { defaultPageInfo, pageInfoTransformer } from '~/data-transformers/page-info-transformer';

import { addReview } from '../_actions/add-review';
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
    fetchOptions: { next: { revalidate } },
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
      <ReviewsWithForm
        productId={productId}
        averageRating={Streamable.from(() => getAverageRating(productId))}
        emptyStateMessage={t('empty')}
        nextLabel={Streamable.from(async () => t('Pagination.next'))}
        paginationInfo={Streamable.from(() => getPaginationInfo(productId, searchParams))}
        previousLabel={Streamable.from(async () => t('Pagination.previous'))}
        reviews={Streamable.from(() => getFormattedReviews(productId, searchParams))}
        reviewsLabel={t('title')}
        writeReviewLabel={t('Form.writeReview')}
        requireEmail={true}
        formLabels={{
          title: t('Form.title'),
          ratingLabel: t('Form.rating'),
          titleLabel: t('Form.reviewTitle'),
          titlePlaceholder: t('Form.titlePlaceholder'),
          reviewLabel: t('Form.reviewText'),
          reviewPlaceholder: t('Form.reviewPlaceholder'),
          nameLabel: t('Form.name'),
          namePlaceholder: t('Form.namePlaceholder'),
          emailLabel: t('Form.email'),
          emailPlaceholder: t('Form.emailPlaceholder'),
          submitButton: t('Form.submit'),
          submittingButton: t('Form.submitting'),
          cancelButton: t('Form.cancel'),
        }}
        onSubmitReview={addReview}
      />
      <Stream fallback={null} value={Streamable.from(() => getReviews(productId, searchParams))}>
        {(reviews) =>
          reviews.length > 0 && <ProductReviewSchema productId={productId} reviews={reviews} />
        }
      </Stream>
    </>
  );
};
