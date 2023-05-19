import { Star, StarHalf, StarHalfIcon } from 'lucide-react';
import { useId } from 'react';

import { getProductReviewSummary } from '@client';

interface Props {
  productId: number;
  reviewSectionId: string;
}

export const ReviewSummary = async ({ productId, reviewSectionId }: Props) => {
  const reviewId = useId();
  const { numberOfReviews, averageRating } = await getProductReviewSummary(productId);

  return (
    <div className="flex items-center gap-3">
      <Star fill="currentColor" />
      <StarHalf />
      <StarHalfIcon />
      <p aria-describedby={reviewId} className="flex flex-nowrap text-[#053FB0]">
        {new Array(5).fill(undefined).map((_, i) => {
          const index = i + 1;

          if (averageRating >= index) {
            return <Star key={i} role="presentation" />;
          }

          if (averageRating < index && averageRating - index > -1) {
            return <StarHalf key={i} role="presentation" />;
          }

          return <Star key={i} role="presentation" />;
        })}
      </p>
      <div className="font-semibold" id={reviewId}>
        <span className="sr-only">Rating:</span>
        {averageRating} <span className="sr-only">out of 5 stars.</span> (
        <span className="sr-only">Number of reviews:</span>
        {numberOfReviews})
      </div>
      <a className="font-semibold text-[#053FB0]" href={`#${reviewSectionId}`}>
        Write review
      </a>
    </div>
  );
};
