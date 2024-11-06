import { Card, CardProps, CardSkeleton } from '@/vibes/soul/primitives/card';
import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '@/vibes/soul/primitives/carousel';

export interface Card extends CardProps {
  id: string;
}

interface Props {
  cards: Card[];
  textContrast?: 'light' | 'dark';
  className?: string;
}

export function CardCarousel({ cards, textContrast, className }: Props) {
  return (
    <Carousel className={className}>
      <CarouselContent className="mb-20">
        {cards.length > 0
          ? cards.map((card) => (
              <CarouselItem
                className="basis-full @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4"
                key={card.id}
              >
                <Card {...card} textContrast={textContrast} />
              </CarouselItem>
            ))
          : Array.from({ length: 5 }).map((_, index) => (
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
