'use client';

import { BcImage } from '~/components/bc-image';
import React, { useCallback, useEffect, useState } from 'react';

import { clsx } from 'clsx';
import { X } from 'lucide-react';

interface Default {
  type: 'default';
  images?: string[];
}

interface Full {
  type: 'full';
  backgroundImage: string;
}

interface Split {
  type: 'split';
  image: string;
}

interface Banner {
  type: 'banner';
}

interface Props {
  title: string;
  targetDate: Date;
  variant: Default | Full | Split | Banner;
}

export const Countdown = function Countdown({
  title,
  targetDate,
  variant = { type: 'default' },
}: Props) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [banner, setBanner] = useState({ dismissed: false, initialized: false });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [targetDate]);

  useEffect(() => {
    const hidden = localStorage.getItem('hidden-countdown') === 'true';
    setBanner({ dismissed: hidden, initialized: true });
  }, []);

  const hideBanner = useCallback(() => {
    setBanner((prev) => ({ ...prev, dismissed: true }));
    localStorage.setItem('hidden-countdown', 'true');
  }, []);

  if (!banner.initialized) return null;

  function calculateTimeLeft() {
    const difference = +targetDate - +new Date();
    let timeRemaining = { days: 0, hours: 0, mins: 0, secs: 0 };

    if (difference > 0) {
      timeRemaining = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        mins: Math.floor((difference / 1000 / 60) % 60),
        secs: Math.floor((difference / 1000) % 60),
      };
    }

    return timeRemaining;
  }

  const AnimatedNumber = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
      const timeout = setTimeout(() => setDisplayValue(value));
      return () => clearTimeout(timeout);
    }, [value]);

    return (
      <div className="relative h-14 overflow-hidden [&>*]:h-14">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            style={{ transform: `translateY(-${displayValue * 100}%)` }}
            className="flex flex-shrink-0 flex-col items-center justify-center"
          >
            {i}
          </div>
        ))}
      </div>
    );
  };

  const TwoDigitAnimatedNumber = ({ value }: { value: number }) => (
    <div
      className={clsx(
        'flex items-center justify-center rounded-lg',
        variant.type === 'full'
          ? 'bg-primary-shadow text-primary'
          : 'bg-primary text-primary-shadow',
        {
          default: 'h-14 w-14 @2xl:h-28 @2xl:w-28',
          full: 'h-14 w-14 @2xl:h-28 @2xl:w-28',
          split: 'h-14 w-14 @2xl:h-16 @2xl:w-16',
          banner: 'h-9 w-9',
        }[variant.type],
      )}
    >
      <AnimatedNumber value={Math.floor(value / 10)} />
      <AnimatedNumber value={value % 10} />
    </div>
  );

  return (
    <section
      className={clsx('relative grid origin-top transition-all duration-300 ease-out @container', {
        'pointer-events-none grid-rows-[0fr]': variant.type === 'banner' && banner.dismissed,
        'grid-rows-[1fr]': variant.type === 'banner' && !banner.dismissed,
        'fixed top-0': variant.type === 'banner',
        'bg-primary-shadow': variant.type === 'default' || variant.type === 'split',
      })}
    >
      <div className="overflow-hidden">
        <div
          className={clsx(
            'relative flex flex-col items-center justify-center overflow-hidden bg-primary-shadow bg-cover bg-center bg-no-repeat font-medium',
            {
              default: 'py-32 @5xl:container @5xl:mx-auto',
              full: 'py-40',
              split: '@5xl:container @3xl:mx-auto @3xl:grid @3xl:grid-cols-2',
              banner: '',
            }[variant.type],
          )}
        >
          {variant.type === 'full' || variant.type === 'split' ? (
            <BcImage
              src={variant.type === 'full' ? variant.backgroundImage : variant.image}
              alt={title}
              height={1000}
              width={1000}
              className={clsx('h-full w-full object-cover', {
                'absolute inset-0': variant.type === 'full',
              })}
            />
          ) : null}

          {variant.type === 'default' && variant.images
            ? variant.images.map((image, index) => (
                <BcImage
                  key={`image-${index + 1}`}
                  src={image}
                  alt={title}
                  height={500}
                  width={500}
                  className={clsx(
                    'absolute object-contain',
                    index === 0
                      ? '-left-20 top-0 -translate-y-2/3 @5xl:-translate-y-1/3'
                      : '-right-20 bottom-0 translate-y-2/3 @5xl:translate-y-1/3',
                  )}
                />
              ))
            : null}

          <div
            className={clsx(
              'relative z-10 text-center text-white',
              {
                default:
                  'text-3xl @2xl:text-6xl [&>div>div>span]:text-lg [&>h2]:text-3xl @2xl:[&>h2]:text-[40px]',
                full: 'text-3xl @2xl:text-6xl [&>div>div>span]:text-lg',
                split: 'py-9 text-3xl @2xl:text-[40px] [&>div>div>span]:text-xs [&>h2]:text-2xl',
                banner:
                  'flex flex-col items-center gap-4 py-2.5 text-lg @xl:flex-row @xl:gap-6 @2xl:text-xl [&>div>div>span]:text-xs [&>div>span]:mt-0.5',
              }[variant.type],
            )}
          >
            <h2
              className={clsx('leading-[1.1] [text-wrap:pretty]', {
                'mb-6 max-w-2xl': variant.type !== 'banner',
              })}
            >
              {title}
            </h2>
            <div className="flex justify-center space-x-2">
              {Object.entries(timeLeft).map(([unit, value], index, array) => (
                <React.Fragment key={unit}>
                  <div key={unit} className="flex flex-col items-center">
                    <TwoDigitAnimatedNumber value={value} />
                    <span className="mt-1 capitalize">{unit}</span>
                  </div>
                  {index < array.length - 1 && <span>:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Close button (banner variation) */}
        {variant.type === 'banner' ? (
          <button
            aria-label="Dismiss banner"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              hideBanner();
            }}
            className="absolute right-5 top-1/2 z-10 -translate-y-1/2 text-white transition-transform hover:scale-110"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>
    </section>
  );
};
