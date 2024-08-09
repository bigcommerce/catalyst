import { ReactElement } from 'react';

import { cn } from '~/lib/utils';

import { StarEmptyIcon } from './star-icons/star-empty';
import { StarFilledIcon } from './star-icons/star-filled';
import { StarHalfIcon } from './star-icons/star-half';

const MAX_RATING = 5;
const roundHalf = (num: number) => {
  return Math.round(num * 2) / 2;
};

interface Props {
  className?: string;
  rating: number;
  size?: number;
}

const Rating = ({ className, rating, size = 24 }: Props) => {
  const stars: ReactElement[] = [];
  const roundedRating = roundHalf(rating);

  for (let i = 1; i <= MAX_RATING; i += 1) {
    if (roundedRating - i >= 0) {
      stars.push(<StarFilledIcon height={size} key={i} width={size} />);
    } else if (roundedRating - i > -1) {
      stars.push(<StarHalfIcon height={size} key={i} width={size} />);
    } else {
      stars.push(<StarEmptyIcon height={size} key={i} width={size} />);
    }
  }

  return (
    <span className={cn('inline-flex fill-current', className)} role="img">
      {stars}
    </span>
  );
};

Rating.displayName = 'Rating';

export { Rating };
