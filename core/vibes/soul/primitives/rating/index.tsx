import { clsx } from 'clsx';

export interface Props {
  showRating?: boolean;
  rating: number;
  className?: string;
}

interface StarType {
  type: 'empty' | 'half' | 'full';
}

const Star = ({ type }: StarType) => {
  const paths = {
    empty: (
      <path
        d="M9.99984 1.66669L12.5748 6.88335L18.3332 7.72502L14.1665 11.7834L15.1498 17.5167L9.99984 14.8084L4.84984 17.5167L5.83317 11.7834L1.6665 7.72502L7.42484 6.88335L9.99984 1.66669Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.4"
      />
    ),
    half: (
      <>
        <path
          d="M9.99984 1.66669L12.5748 6.88335L18.3332 7.72502L14.1665 11.7834L15.1498 17.5167L9.99984 14.8084L4.84984 17.5167L5.83317 11.7834L1.6665 7.72502L7.42484 6.88335L9.99984 1.66669Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.0003 1.6665V14.8082L4.85033 17.5165L5.83366 11.7832L1.66699 7.72484L7.42533 6.88317L10.0003 1.6665Z"
          fill="currentColor"
        />
      </>
    ),
    full: (
      <path
        d="M9.99984 1.66669L12.5748 6.88335L18.3332 7.72502L14.1665 11.7834L15.1498 17.5167L9.99984 14.8084L4.84984 17.5167L5.83317 11.7834L1.6665 7.72502L7.42484 6.88335L9.99984 1.66669Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  };

  return (
    <svg
      className="inline-block text-foreground"
      fill="none"
      height={20}
      viewBox="0 0 20 20"
      width={20}
    >
      {paths[type]}
    </svg>
  );
};

export const Rating = function Rating({ showRating = true, rating, className }: Readonly<Props>) {
  const adjustedRating = Math.min(rating, 5);

  const stars: Array<StarType['type']> = Array.from({ length: 5 }, (_, index) => {
    if (index < Math.floor(adjustedRating)) return 'full';
    if (index < Math.ceil(adjustedRating)) return 'half';

    return 'empty';
  });

  return (
    <div className={clsx('flex items-center', className)}>
      {stars.map((type, index) => (
        <Star key={index} type={type} />
      ))}

      {showRating && (
        <span className="ml-1.5 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full border border-contrast-100 px-1 text-xs font-medium text-contrast-400">
          {adjustedRating % 1 !== 0 ? adjustedRating.toFixed(1) : adjustedRating}
        </span>
      )}
    </div>
  );
};
