import clsx from 'clsx';
import { Suspense } from 'react';

import { Card, CardProps, CardSkeleton } from '../card';
import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '@/vibes/soul/primitives/carousel';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { mapStreamable } from '@/vibes/soul/lib/streamable/server';

export type Card = CardProps & {
  id: string;
};

type Props = {
  cards: Streamable<Card[]>;
  textContrast?: 'light' | 'dark';
  className?: string;
  classNames?: {
    root?: string,
    content?: string,
    item?: string,
    card?: string
  };
  emptyStateMessage?: string;
};

export function CardCarousel({
  cards: streamableCards,
  textContrast,
  className,
  classNames,
  emptyStateMessage = 'No items found',
}: Props) {
  return (
    <Carousel className={clsx('overflow-x-hidden', className)}>
      <CarouselContent className="mb-10">
        <Suspense
          fallback={<CardCarouselSkeleton className={className} message={emptyStateMessage} />}
        >
          {mapStreamable(streamableCards, (cards) => {
            if (cards.length === 0) {
              return <CardCarouselSkeleton className={className} message={emptyStateMessage} />;
            }

            return cards.map((card) => (
              <CarouselItem
                className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6"
                key={card.id}
              >
                <Card {...card} textContrast={textContrast} />
              </CarouselItem>
            ));
          })}
        </Suspense>
      </CarouselContent>
      <div className="flex w-full items-center justify-between">
        <CarouselScrollbar />
        <CarouselButtons />
      </div>
    </Carousel>
  );
}

export function CardCarouselSkeleton({
  className,
  classNames,
  message,
  count = 8,
}: {
  className?: string;
  classNames?: {
    root?: string,
    content?: string,
    item?: string,
    card?: string
  };
  message?: string;
  count?: number;
}) {
  return (
    <Carousel className={clsx('overflow-x-hidden', className)}>
      <CarouselContent
        className={clsx(
          'relative mb-10',
          message && message !== '' && '[mask-image:radial-gradient(circle,transparent,black)]',
        )}
      >
        {Array.from({ length: count }).map((_, index) => (
          <CarouselItem
            className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6"
            key={index}
          >
            <CardSkeleton />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex w-full items-center justify-between">
        <CarouselScrollbar />
        <CarouselButtons />
      </div>
      <div className="absolute inset-0 flex items-center justify-center text-lg">{message}</div>
    </Carousel>
  );
}
