import React, { useState } from 'react';

import clsx from 'clsx';

import { Rating, Star } from '@smastrom/react-rating';

import '@smastrom/react-rating/style.css';

interface Props {
  className?: string;
  stars?: number;
}

const customStyles = {
  itemShapes: Star,
  activeFillColor: 'black',
  inactiveFillColor: 'transparent',
  itemStrokeWidth: 3,
};

export function ReviewRating({ className, stars = 3 }: Props) {
  return (
    <Rating
      className={clsx(className, 'max-w-[120px]')}
      value={stars}
      itemStyles={customStyles}
      readOnly
    />
  );
}
