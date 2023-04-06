import React, { ComponentPropsWithoutRef } from 'react';

import { EmptyStarIcon } from '../icons/stars/EmptyStar';
import { FilledStarIcon } from '../icons/stars/FilledStar';
import { HalfFilledStarIcon } from '../icons/stars/HalfFilledStar';

import { ComponentClasses } from './types';

interface RatingProps extends ComponentPropsWithoutRef<'span'> {
  value: number | null;
}

type Rating = React.FC<RatingProps> &
  ComponentClasses<'default'> & {
    Icon: ComponentClasses<'default'>;
  };

const MAX_RATING = 5;
const roundHalf = (num: number) => {
  return Math.round(num * 2) / 2;
};

export const Rating: Rating = ({ value, ...props }) => {
  const stars: React.ReactElement[] = [];
  const rating = value ? roundHalf(value) : 0;

  for (let i = 1; i <= MAX_RATING; i += 1) {
    if (rating - i >= 0) {
      stars.push(<FilledStarIcon className={Rating.Icon.default.className} key={i} />);
    } else if (rating - i > -1) {
      stars.push(<HalfFilledStarIcon className={Rating.Icon.default.className} key={i} />);
    } else {
      stars.push(<EmptyStarIcon className={Rating.Icon.default.className} key={i} />);
    }
  }

  return (
    <span className={Rating.default.className} role="img" {...props}>
      {stars}
    </span>
  );
};

Rating.default = {
  className: 'inline-flex',
};

Rating.Icon = {
  default: {
    className: 'fill-[#053FB0] stroke-none',
  },
};
