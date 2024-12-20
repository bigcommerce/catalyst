import { Rating } from '~/components/ui/rating';
import { cn } from '~/lib/utils';

interface Props {
  size?: number,
  numberOfReviews: number, 
  averageRating: number,
  className?: string;
}

export const ReviewSummary = ({ size = 16, numberOfReviews = 0, averageRating = 0, className }: Props) => {
  const hasNoReviews = numberOfReviews === 0;

  return (
    <div className={cn('ratings-star flex items-center space-x-2', className)}>
      <Rating rating={averageRating} size={size} className={cn('flex space-x-0.5 items-center flex-nowrap text-primary', hasNoReviews && 'text-gray-400')} />
      <span className="review-count">({numberOfReviews})</span>
    </div>
  );
};