import { Card, CardProps, CardSkeleton } from '@/vibes/soul/primitives/card'
import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '@/vibes/soul/primitives/carousel'

export interface Card extends CardProps {
  id: string
}

interface Props {
  cards: Card[]
  textContrast?: 'light' | 'dark'
  className?: string
}

export function CardCarousel({ cards, textContrast, className }: Props) {
  return (
    <Carousel className={className}>
      <CarouselContent className="mb-20 px-3 @xl:px-6 @4xl:px-20">
        {cards.length > 0
          ? cards.map(card => (
              <CarouselItem className="basis-full @md:basis-1/2 @xl:basis-1/4">
                <Card key={card.id} {...card} textContrast={textContrast} />
              </CarouselItem>
            ))
          : Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem className="basis-full @md:basis-1/2 @xl:basis-1/4">
                <CardSkeleton key={index} />
              </CarouselItem>
            ))}
      </CarouselContent>
      <div className="flex items-center justify-between px-3 @xl:px-6 @5xl:px-20">
        <CarouselScrollbar />
        <CarouselButtons />
      </div>
    </Carousel>
  )
}
