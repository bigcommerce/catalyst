import { LucideIcon } from 'lucide-react';
import { ComponentPropsWithoutRef, FC, ReactElement } from 'react';

import { cn } from '~/lib/utils';

import { StarEmptyIcon } from './star-icons/star-empty';
import { StarFilledIcon } from './star-icons/star-filled';
import { StarHalfIcon } from './star-icons/star-half';

const MAX_RATING = 5;
const roundHalf = (num: number) => {
  return Math.round(num * 2) / 2;
};

type StarIconType = FC<ComponentPropsWithoutRef<'svg'>> | LucideIcon;

interface Props extends ComponentPropsWithoutRef<'span'> {
  size?: number;
  starEmptyIcon?: StarIconType;
  starFilledIcon?: StarIconType;
  starHalfIcon?: StarIconType;
  strokeColor?: string;
  value: number;
}

const Rating = ({
  className,
  size = 24,
  starEmptyIcon,
  starFilledIcon,
  starHalfIcon,
  value,
  ...props
}: Props) => {
  const stars: ReactElement[] = [];
  const rating = roundHalf(value);

  const StarHalf = starHalfIcon || StarHalfIcon;
  const StarEmpty = starEmptyIcon || StarEmptyIcon;
  const StarFilled = starFilledIcon || StarFilledIcon;

  for (let i = 1; i <= MAX_RATING; i += 1) {
    if (rating - i >= 0) {
      stars.push(<StarFilled height={size} key={i} width={size} />);
    } else if (rating - i > -1) {
      stars.push(<StarHalf height={size} key={i} width={size} />);
    } else {
      stars.push(<StarEmpty height={size} key={i} width={size} />);
    }
  }

  return (
    <span className={cn('inline-flex fill-current', className)} role="img" {...props}>
      {stars}
    </span>
  );
};

Rating.displayName = 'Rating';

export { Rating };
