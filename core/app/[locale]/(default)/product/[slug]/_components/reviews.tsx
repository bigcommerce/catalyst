import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations } from 'next-intl/server';
import { createLoader, parseAsString, SearchParams } from 'nuqs/server';
import { cache } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Reviews as ReviewsSection } from '@/vibes/soul/sections/reviews';
import { auth } from '~/auth';
import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { defaultPageInfo, pageInfoTransformer } from '~/data-transformers/page-info-transformer';

import { submitReview } from '../_actions/submit-review';
import { getStreamableProduct } from '../page-data';

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
  streamableImages: Streamable<Array<{ src: string; alt: string }>>;
  streamableProduct: Streamable<Awaited<ReturnType<typeof getStreamableProduct>>>;
}

export const Reviews = async ({
  productId,
  searchParams,
  streamableProduct,
  streamableImages,
}: Props) => {
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

  const streamableProductName = Streamable.from(async () => {
    const product = await streamableProduct;

    return { name: product?.name ?? '' };
  });

  const streamableUser = Streamable.from(async () => {
    const session = await auth();
    const firstName = session?.user?.firstName ?? '';
    const lastName = session?.user?.lastName ?? '';

    if (!firstName || !lastName) {
      return { email: session?.user?.email ?? '', name: '' };
    }

    const lastInitial = lastName.charAt(0).toUpperCase();
    const obfuscatedName = `${firstName} ${lastInitial}.`;

    return { email: session?.user?.email ?? '', name: obfuscatedName };
  });

  return (
    <>
      <ReviewsSection
        action={submitReview}
        averageRating={streamableAvergeRating}
        emptyStateMessage={t('empty')}
        formButtonLabel={t('Form.button')}
        formEmailLabel={t('Form.emailLabel')}
        formModalTitle={t('Form.title')}
        formNameLabel={t('Form.nameLabel')}
        formRatingLabel={t('Form.ratingLabel')}
        formReviewLabel={t('Form.reviewLabel')}
        formSubmitLabel={t('Form.submit')}
        formTitleLabel={t('Form.titleLabel')}
        nextLabel={t('next')}
        paginationInfo={streamablePaginationInfo}
        previousLabel={t('previous')}
        productId={productId}
        reviews={streamableReviews}
        reviewsLabel={t('title')}
        streamableImages={streamableImages}
        streamableProduct={streamableProductName}
        streamableUser={streamableUser}
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
