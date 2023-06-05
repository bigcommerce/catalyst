import { getProductReviews } from '@bigcommerce/catalyst-client';
import { Star, StarHalf } from 'lucide-react';
import { useId } from 'react';

interface Props {
  productId: number;
  reviewSectionId: string;
}

export const ReviewSummary = async ({ productId, reviewSectionId }: Props) => {
  const summaryId = useId();

  const reviews = await getProductReviews(productId);

  if (!reviews) {
    return null;
  }

  const { numberOfReviews, averageRating } = reviews.reviewSummary;

  return (
    <div className="flex items-center gap-3">
      <p aria-describedby={summaryId} className="flex flex-nowrap text-blue-primary">
        {new Array(5).fill(undefined).map((_, i) => {
          const index = i + 1;

          if (averageRating >= index) {
            return <Star fill="currentColor" key={i} role="presentation" />;
          }

          if (averageRating < index && averageRating - index > -1) {
            return (
              <span className="relative" key={i}>
                <StarHalf fill="currentColor" role="presentation" />
                <Star className="absolute left-0 top-0" key={i} role="presentation" />
              </span>
            );
          }

          return <Star key={i} role="presentation" />;
        })}
      </p>

      <div className="font-semibold" id={summaryId}>
        <span className="sr-only">Rating:</span>
        {averageRating} <span className="sr-only">out of 5 stars.</span> (
        <span className="sr-only">Number of reviews:</span>
        {numberOfReviews})
      </div>

      <a className="font-semibold text-blue-primary" href={`#${reviewSectionId}`}>
        Write review
      </a>
    </div>
  );
};
