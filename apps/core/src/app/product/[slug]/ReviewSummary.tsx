import { cs } from '@bigcommerce/reactant/cs';
import { Rating } from '@bigcommerce/reactant/Rating';
import { useId } from 'react';

import client from '~/client';

interface Props {
  productId: number;
  reviewSectionId: string;
}

export const ReviewSummary = async ({ productId, reviewSectionId }: Props) => {
  const summaryId = useId();

  const reviews = await client.getProductReviews(productId);

  if (!reviews) {
    return null;
  }

  const { numberOfReviews, averageRating } = reviews.reviewSummary;

  return (
    <div className="flex items-center gap-3">
      <p
        aria-describedby={summaryId}
        className={cs(
          'flex flex-nowrap text-blue-primary',
          numberOfReviews === 0 && 'text-gray-400',
        )}
      >
        <Rating value={averageRating} />
      </p>

      <div className="font-semibold" id={summaryId}>
        {numberOfReviews > 0 && (
          <>
            <span className="sr-only">Rating:</span>
            {averageRating}
            <span className="sr-only">out of 5 stars.</span>{' '}
          </>
        )}
        <span className="sr-only">Number of reviews:</span>({numberOfReviews})
      </div>

      <a className="font-semibold text-blue-primary" href={`#${reviewSectionId}`}>
        Write review
      </a>
    </div>
  );
};
