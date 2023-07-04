import React, { useState } from 'react';

import clsx from 'clsx';

import { Rating, Star } from '@smastrom/react-rating';

import '@smastrom/react-rating/style.css';

interface Props {
  className?: string;
  color?: string;
  hoverColor?: string;
  stars?: number;
}

export function ReviewRating({
  className,
  stars = 3,
  color = 'black',
  hoverColor = 'var(--blue-primary)',
}: Props) {
  const [hover, setHover] = useState(false);

  const defaultStyles = {
    itemShapes: Star,
    activeFillColor: `${color}`,
    activeStrokeColor: `${color}`,
    inactiveFillColor: 'transparent',
    inactiveStrokeColor: `${color}`,
    itemStrokeWidth: 3,
  };

  const hoverStyles = {
    itemShapes: Star,
    activeFillColor: `${hoverColor}`,
    activeStrokeColor: `${hoverColor}`,
    inactiveFillColor: 'transparent',
    inactiveStrokeColor: `${hoverColor}`,
    itemStrokeWidth: 3,
  };

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Rating
        className={clsx(className, 'max-w-[120px] ')}
        value={stars}
        itemStyles={hover ? hoverStyles : defaultStyles}
        readOnly
      />
    </div>
  );
}
