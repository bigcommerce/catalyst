import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '@/vibes/soul/primitives/carousel';

interface Slide {
  children: React.ReactNode;
}

interface MSCarouselProps {
  className: string;
  slides?: Slide[];
  showScrollbar: boolean;
  showArrows: boolean;
  colorScheme: 'light' | 'dark';
}

export function MSCarousel({
  className,
  slides,
  showScrollbar = true,
  showArrows = true,
  colorScheme,
}: MSCarouselProps) {
  return (
    <div className={className}>
      {!slides || slides.length < 1 ? (
        <div className="p-4 text-center text-lg text-gray-400">Add items to the carousel</div>
      ) : (
        <Carousel>
          <CarouselContent className="mb-10">
            {slides.map(({ children }, index) => (
              <CarouselItem
                className="basis-full @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4"
                key={index}
              >
                {children}
              </CarouselItem>
            ))}
          </CarouselContent>
          {(showScrollbar || showArrows) && (
            <div className="mt-10 flex w-full items-center justify-between">
              {showScrollbar && <CarouselScrollbar colorScheme={colorScheme} />}
              {showArrows && <CarouselButtons colorScheme={colorScheme} />}
            </div>
          )}
        </Carousel>
      )}
    </div>
  );
}
