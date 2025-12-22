'use client';

import { Rating, type Props as RatingProps } from '@/vibes/soul/primitives/rating';

interface Props extends RatingProps {
  scrollTargetId: string;
}

export function RatingLink({ scrollTargetId, ...ratingProps }: Props) {
  const handleClick = () => {
    const element = document.getElementById(scrollTargetId);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <button
      aria-label="Scroll to reviews"
      className="cursor-pointer text-left"
      onClick={handleClick}
      type="button"
    >
      <Rating {...ratingProps} />
    </button>
  );
}
