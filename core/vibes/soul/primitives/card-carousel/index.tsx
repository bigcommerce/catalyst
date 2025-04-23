import { clsx } from 'clsx';

import { Card, CardProps, CardSkeleton } from '@/vibes/soul/primitives/card';
import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '@/vibes/soul/primitives/carousel';

import { Stream, Streamable } from '../../lib/streamable';

export type Card = CardProps & {
  id: string;
};

export interface CardCarouselProps {
  cards: Streamable<Card[]>;
  aspectRatio?: '5:6' | '3:4' | '1:1';
  textColorScheme?: 'light' | 'dark';
  iconColorScheme?: 'light' | 'dark';
  carouselColorScheme?: 'light' | 'dark';
  className?: string;
  emptyStateMessage?: string;
  scrollbarLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  showButtons?: boolean;
  showScrollbar?: boolean;
  hideOverflow?: boolean;
}

export function CardCarousel({
  cards: streamableCards,
  aspectRatio = '5:6',
  textColorScheme,
  iconColorScheme,
  carouselColorScheme,
  className,
  emptyStateMessage = 'No items found',
  scrollbarLabel,
  previousLabel,
  nextLabel,
  showButtons = true,
  showScrollbar = true,
  hideOverflow,
}: CardCarouselProps) {
  return (
    <Carousel className={className} hideOverflow={hideOverflow}>
      <CarouselContent>
        <Stream
          fallback={<CardCarouselSkeleton className={className} message={emptyStateMessage} />}
          value={streamableCards}
        >
          {(cards) => {
            if (cards.length === 0) {
              return <CardCarouselSkeleton className={className} message={emptyStateMessage} />;
            }

            return cards.map((card) => (
              <CarouselItem
                className="basis-[calc(100%-1rem)] @md:basis-[calc(50%-0.75rem)] @lg:basis-[calc(33%-0.5rem)] @2xl:basis-[calc(25%-0.25rem)]"
                key={card.id}
              >
                <Card
                  {...card}
                  aspectRatio={aspectRatio}
                  iconColorScheme={iconColorScheme}
                  textColorScheme={textColorScheme}
                />
              </CarouselItem>
            ));
          }}
        </Stream>
      </CarouselContent>
      {(showButtons || showScrollbar) && (
        <div className="mt-10 flex w-full items-center justify-between gap-8">
          <CarouselScrollbar
            className={clsx(!showScrollbar && 'pointer-events-none invisible')}
            colorScheme={carouselColorScheme}
            label={scrollbarLabel}
          />
          <CarouselButtons
            className={clsx(!showButtons && 'pointer-events-none invisible')}
            colorScheme={carouselColorScheme}
            nextLabel={nextLabel}
            previousLabel={previousLabel}
          />
        </div>
      )}
    </Carousel>
  );
}

export function CardCarouselSkeleton({
  className,
  message,
  count = 8,
  hideOverflow,
}: {
  className?: string;
  message?: string;
  count?: number;
  hideOverflow?: boolean;
}) {
  return (
    <Carousel className={className} hideOverflow={hideOverflow}>
      <CarouselContent
        className={clsx(
          'relative mb-10',
          message != null &&
            message !== '' &&
            '[mask-image:radial-gradient(circle,transparent,black)]',
        )}
      >
        {Array.from({ length: count }).map((_, index) => (
          <CarouselItem
            className="basis-full @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4"
            key={index}
          >
            <CardSkeleton />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="bg-contrast-100 h-6 w-56 animate-pulse" />
      <div className="absolute inset-0 flex items-center justify-center text-lg">{message}</div>
    </Carousel>
  );
}
