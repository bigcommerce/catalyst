import { Rating } from '@bigcommerce/components/Rating';
import { useId } from 'react';

import { getProductReviews } from '~/client/queries/get-product-reviews';
import { cn } from '~/lib/utils';

interface Props {
  productId: number;
}

export const ReviewSummary = async ({ productId }: Props) => {
  const summaryId = useId();

  const reviews = await getProductReviews(productId);

  if (!reviews) {
    return null;
  }

  const { numberOfReviews, averageRating } = reviews.reviewSummary;

  const hasNoReviews = numberOfReviews === 0;

  return (
    <div className="flex items-center gap-3">
      <p
        aria-describedby={summaryId}
        className={cn('flex flex-nowrap text-blue-primary', hasNoReviews && 'text-gray-400')}
      >
        <Rating value={averageRating} />
      </p>

      <div className="font-semibold" id={summaryId}>
        {!hasNoReviews && (
          <>
            <span className="sr-only">Rating:</span>
            {averageRating}
            <span className="sr-only">out of 5 stars.</span>{' '}
          </>
        )}
        <span className="sr-only">Number of reviews:</span>({numberOfReviews})
      </div>
    </div>
  );
};
