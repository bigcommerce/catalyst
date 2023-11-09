import { LucideIcon } from 'lucide-react';
import {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementRef,
  FC,
  forwardRef,
  ReactElement,
} from 'react';

import { cs } from '../../utils/cs';

import { StarEmptyIcon } from './StarIcons/StarEmpty';
import { StarFilledIcon } from './StarIcons/StarFilled';
import { StarHalfIcon } from './StarIcons/StarHalf';

const MAX_RATING = 5;
const roundHalf = (num: number) => {
  return Math.round(num * 2) / 2;
};

type StarIconType = FC<ComponentPropsWithoutRef<'svg'>> | LucideIcon;

interface RatingProps extends ComponentPropsWithRef<'span'> {
  starEmptyIcon?: StarIconType;
  starFilledIcon?: StarIconType;
  starHalfIcon?: StarIconType;
  size?: number;
  strokeColor?: string;
  value: number;
}

export const Rating = forwardRef<ElementRef<'span'>, RatingProps>(
  ({ className, starFilledIcon, starHalfIcon, starEmptyIcon, size = 24, value, ...props }, ref) => {
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
      <span className={cs('inline-flex fill-current', className)} ref={ref} role="img" {...props}>
        {stars}
      </span>
    );
  },
);

Rating.displayName = 'Rating';
