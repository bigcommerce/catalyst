import { Card, CardProps, CardSkeleton } from '@/vibes/soul/primitives/card';
import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '@/vibes/soul/primitives/carousel';

export type Card = CardProps & {
  id: string;
};

type Props = {
  cards: Card[];
  textContrast?: 'light' | 'dark';
  className?: string;
  emptyStateMessage?: string;
};

export function CardCarousel({ cards, textContrast, className, emptyStateMessage }: Props) {
  if (cards.length === 0) {
    return <CardCarouselEmptyState className={className} message={emptyStateMessage} />;
  }

  return (
    <Carousel className={className}>
      <CarouselContent className="mb-10">
        {cards.map((card) => (
          <CarouselItem
            className="basis-full @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4"
            key={card.id}
          >
            <Card {...card} textContrast={textContrast} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex w-full items-center justify-between">
        <CarouselScrollbar />
        <CarouselButtons />
      </div>
    </Carousel>
  );
}

export function CardCarouselEmptyState({
  className,
  message = 'No items found',
}: {
  className?: string;
  message?: string;
}) {
  return (
    <Carousel className={className}>
      <CarouselContent className="relative mb-10 [mask-image:radial-gradient(circle,transparent,black)]">
        {Array.from({ length: 8 }).map((_, index) => (
          <CarouselItem
            className="basis-full @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4"
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

export function CardCarouselSkeleton({ className }: Props) {
  return (
    <Carousel className={className}>
      <CarouselContent className="mb-10">
        {Array.from({ length: 8 }).map((_, index) => (
          <CarouselItem
            className="basis-full @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4"
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
    </Carousel>
  );
}
