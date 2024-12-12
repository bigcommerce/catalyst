import clsx from 'clsx';
import { Suspense } from 'react';

import { Card, CardProps, CardSkeleton } from '../card';
import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '../carousel';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { mapStreamable } from '@/vibes/soul/lib/streamable/server';

export type Card = CardProps & {
  id: string;
};

type Props = {
  cards: Streamable<Card[]>;
  classNames?: {
    root?: string,
    content?: string,
    item?: string
  };
  emptyStateMessage?: string;
};

export function CardCarousel({
  cards: streamableCards,
  classNames,
  emptyStateMessage = 'No items found',
}: Props) {
  return (
    <Carousel className={clsx('overflow-x-hidden w-full max-w-full relative', classNames?.root)}>
      <CarouselContent className={clsx('mb-10', classNames?.content)}>
        <Suspense
          fallback={<CardCarouselSkeleton classNames={classNames} message={emptyStateMessage} />}
        >
          {mapStreamable(streamableCards, (cards) => {
            if (cards.length === 0) {
              return <CardCarouselSkeleton classNames={classNames} message={emptyStateMessage} />;
            }

            return cards.map((card) => (
              <CarouselItem
                className={clsx('basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6', classNames?.item)}
                key={card.id}
              >
                <Card {...card} />
              </CarouselItem>
            ));
          })}
        </Suspense>
      </CarouselContent>
      <CarouselScrollbar />
      <CarouselButtons />
    </Carousel>
  );
}

export function CardCarouselSkeleton({
  classNames,
  message,
  count = 8,
}: {
  classNames?: {
    root?: string,
    content?: string,
    item?: string
  };
  message?: string;
  count?: number;
}) {
  return (
    <Carousel className={clsx('overflow-x-hidden w-full max-w-full relative', classNames?.root)}>
      <CarouselContent
        className={clsx(
          'relative mb-10',
          classNames?.content,
          message && message !== '' && '[mask-image:radial-gradient(circle,transparent,black)]',
        )}
      >
        {Array.from({ length: count }).map((_, index) => (
          <CarouselItem
            className={clsx('basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6', classNames?.item)}
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
