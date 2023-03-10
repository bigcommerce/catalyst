import React from 'react';

import { EmptyStarIcon } from '../icons/stars/EmptyStar';
import { FilledStarIcon } from '../icons/stars/FilledStar';
import { HalfFilledStarIcon } from '../icons/stars/HalfFilledStar';

interface ClassName {
  className: string;
}

type ComponentProps<Props, VariantKey extends string> = React.FC<Props> &
  Record<VariantKey, ClassName>;

interface Rating {
  value: number | null;
}

type RatingProps = React.HTMLAttributes<HTMLImageElement> & Rating;
type RatingComponent = ComponentProps<RatingProps, 'default'> & {
  Icon: { className: string };
};

const MAX_RATING = 5;
const roundHalf = (num: number) => {
  return Math.round(num * 2) / 2;
};

export const Rating: RatingComponent = ({ value, ...props }) => {
  const stars: React.ReactElement[] = [];
  const rating = value ? roundHalf(value) : 0;

  for (let i = 1; i <= MAX_RATING; i += 1) {
    if (rating - i >= 0) {
      stars.push(<FilledStarIcon className={Rating.Icon.className} key={i} />);
    } else if (rating - i > -1) {
      stars.push(<HalfFilledStarIcon className={Rating.Icon.className} key={i} />);
    } else {
      stars.push(<EmptyStarIcon className={Rating.Icon.className} key={i} />);
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
  className: 'fill-[#053FB0] stroke-none',
};
