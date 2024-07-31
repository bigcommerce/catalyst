import useEmblaCarousel, { UseEmblaCarouselType } from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  ComponentPropsWithoutRef,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';

import { cn } from '~/lib/utils';

type CarouselApi = UseEmblaCarouselType[1];

interface Props extends ComponentPropsWithoutRef<'div'> {
  items: ReactNode[];
  title: string;
  pageSize?: 2 | 3 | 4;
}

const Carousel = ({ className, children, pageSize = 4, title, items, ...props }: Props) => {
  const id = useId();
  const titleId = useId();
  const itemsPerGroup = pageSize;

  const [carouselRef, api] = useEmblaCarousel({
    loop: true,
    axis: 'x',
  });

  const groupedItems = useMemo(() => {
    return items.reduce<ReactNode[][]>((batches, _, index) => {
      if (index % itemsPerGroup === 0) {
        batches.push([]);
      }

      const item = items[index];

      if (batches[batches.length - 1] && item) {
        batches[batches.length - 1]?.push(item);
      }

      return batches;
    }, []);
  }, [items, itemsPerGroup]);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [selectedSnapIndex, setSelectedSnapIndex] = useState(0);

  const [slidesInView, setSlidesInView] = useState<number[]>([0]);

  const onSelect = useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) {
      return;
    }

    setSelectedSnapIndex(emblaApi.selectedScrollSnap());

    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  useEffect(() => {
    if (!api) {
      return;
    }

    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);
    api.on('slidesInView', () => {
      setSlidesInView(api.slidesInView());
    });

    return () => {
      api.off('select', onSelect);
    };
  }, [api, onSelect]);

  return (
    <div
      aria-labelledby={titleId}
      aria-roledescription="carousel"
      className={cn('relative', className)}
      onKeyDownCapture={handleKeyDown}
      role="region"
      {...props}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black lg:text-4xl" id={titleId}>
          {title}
        </h2>
        <span className="no-wrap flex">
          <button
            aria-label="Previous products"
            className={cn(
              'inline-flex h-12 w-12 items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:text-gray-400',
              api?.scrollSnapList().length === 1 && 'hidden',
            )}
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <ArrowLeft />
            <span className="sr-only">Previous slide</span>
          </button>

          <button
            aria-label="Next products"
            className={cn(
              'inline-flex h-12 w-12 items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:text-gray-400',
              api?.scrollSnapList().length === 1 && 'hidden',
            )}
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <ArrowRight />
            <span className="sr-only">Next slide</span>
          </button>
        </span>
      </div>

      <div className="-mx-2 overflow-hidden px-2" ref={carouselRef}>
        <div className="-mx-4 mb-16 mt-8 flex lg:mt-10">
          {groupedItems.map((group, index) => (
            <div
              aria-label={`${index + 1} of ${groupedItems.length}`}
              aria-roledescription="slide"
              className={cn(
                'grid min-w-0 shrink-0 grow-0 basis-full grid-cols-2 gap-6 px-4 lg:gap-8',
                pageSize === 2 && 'md:grid-cols-2',
                pageSize === 3 && 'md:grid-cols-3',
                pageSize === 4 && 'md:grid-cols-4',
                !slidesInView.includes(index) && 'invisible',
              )}
              id={`${id}-slide-${index + 1}`}
              key={index}
              role="group"
            >
              {group.map((item) => item)}
            </div>
          ))}
        </div>
      </div>

      <div
        aria-label="Slides"
        className={cn(
          'no-wrap absolute bottom-1 flex w-full items-center justify-center gap-2',
          api?.scrollSnapList().length === 1 && 'hidden',
        )}
        role="tablist"
      >
        {groupedItems.map((_, index) => (
          <button
            aria-controls={`${id}-slide-${index + 1}`}
            aria-label={`Go to slide ${index + 1}`}
            aria-selected={selectedSnapIndex === index}
            className={cn(
              "h-7 w-7 p-0.5 after:block after:h-0.5 after:w-full after:bg-gray-400 after:content-[''] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
              selectedSnapIndex === index && 'after:bg-black',
            )}
            key={index}
            onClick={() => api?.scrollTo(index)}
            role="tab"
          />
        ))}
      </div>
    </div>
  );
};

export { Carousel };
