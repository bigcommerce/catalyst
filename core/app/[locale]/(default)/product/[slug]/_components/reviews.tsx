import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter } from 'next-intl/server';

import { Reviews as ReviewsComponent } from '@/vibes/soul/sections/reviews';

import { ProductReviewSchema } from './product-review-schema';
import { getReviews } from './reviews-data';

interface Props {
  productId: number;
  searchParams: Record<string, string | string[] | undefined>;
}

export const Reviews = async ({ productId, searchParams }: Props) => {
  // TODO: add translations to component
  // const t = await getTranslations('Product.Reviews');
  const format = await getFormatter();

  const { data } = await getReviews({ entityId: productId, ...searchParams });

  const product = data.site.product;

  if (!product) {
    return null;
  }

  const reviews = removeEdgesAndNodes(product.reviews);
  const { hasNextPage, hasPreviousPage, endCursor, startCursor } = product.reviews.pageInfo;

  const formattedReviews = reviews.map((review) => ({
    id: review.entityId.toString(),
    rating: review.rating,
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
        paginationInfo={
          hasNextPage || hasPreviousPage
            ? {
                startCursorParamName: 'before',
                endCursorParamName: 'after',
                endCursor: hasNextPage ? endCursor : null,
                startCursor: hasPreviousPage ? startCursor : null,
              }
            : undefined
        }
        reviews={formattedReviews}
        totalCount={product.reviewSummary.numberOfReviews}
      />
      {reviews.length > 0 && <ProductReviewSchema productId={productId} reviews={reviews} />}
    </>
  );
};
