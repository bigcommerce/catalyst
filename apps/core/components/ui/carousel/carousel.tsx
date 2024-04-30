import useEmblaCarousel, { UseEmblaCarouselType } from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  ComponentPropsWithRef,
  createContext,
  ElementRef,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { cn } from '~/lib/utils';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

interface CarouselProps {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  setApi?: (api: CarouselApi) => void;
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedSnapIndex: number;
  slidesInView: number[];
} & CarouselProps;

const CarouselContext = createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
}

const Carousel = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'> & CarouselProps>(
  ({ opts, setApi, plugins, className, children, ...props }, ref) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: 'x',
      },
      plugins,
    );

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
      if (!api || !setApi) {
        return;
      }

      setApi(api);
    }, [api, setApi]);

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
      <CarouselContext.Provider
        value={{
          carouselRef,
          api,
          opts,
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          selectedSnapIndex,
          slidesInView,
        }}
      >
        <div
          aria-roledescription="carousel"
          className={cn('relative', className)}
          onKeyDownCapture={handleKeyDown}
          ref={ref}
          role="region"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);

Carousel.displayName = 'Carousel';

const CarouselContent = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => {
    const { carouselRef } = useCarousel();

    return (
      <div className="-mx-2 overflow-hidden px-2" ref={carouselRef}>
        <div className={cn('-mx-6 mb-16 mt-8 flex lg:mt-10', className)} ref={ref} {...props}>
          {children}
        </div>
      </div>
    );
  },
);

CarouselContent.displayName = 'CarouselContent';

const CarouselItem = forwardRef<
  ElementRef<'div'>,
  ComponentPropsWithRef<'div'> & { index: number }
>(({ children, className, index, ...props }, ref) => {
  const { slidesInView } = useCarousel();

  return (
    <div
      aria-roledescription="slide"
      className={cn(
        'grid min-w-0 shrink-0 grow-0 basis-full grid-cols-2 gap-6 px-6 md:grid-cols-4 lg:gap-8',
        !slidesInView.includes(index) && 'invisible',
        className,
      )}
      ref={ref}
      role="group"
      {...props}
    >
      {children}
    </div>
  );
});

CarouselItem.displayName = 'CarouselItem';

const CarouselPreviousIndicator = forwardRef<ElementRef<'button'>, ComponentPropsWithRef<'button'>>(
  ({ children, className, onClick, ...props }, ref) => {
    const { api, scrollPrev, canScrollPrev } = useCarousel();
    const isHidden = api?.scrollSnapList().length === 1;

    return (
      <button
        aria-label="Previous products"
        className={cn(
          'inline-flex h-12 w-12 items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:text-gray-400',
          isHidden && 'hidden',
          className,
        )}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        ref={ref}
        {...props}
      >
        {children || <ArrowLeft />}
        <span className="sr-only">Previous slide</span>
      </button>
    );
  },
);

CarouselPreviousIndicator.displayName = 'CarouselPreviousIndicator';

const CarouselNextIndicator = forwardRef<ElementRef<'button'>, ComponentPropsWithRef<'button'>>(
  ({ children, className, onClick, ...props }, ref) => {
    const { api, scrollNext, canScrollNext } = useCarousel();
    const isHidden = api?.scrollSnapList().length === 1;

    return (
      <button
        aria-label="Next products"
        className={cn(
          'inline-flex h-12 w-12 items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:text-gray-400',
          isHidden && 'hidden',
          className,
        )}
        disabled={!canScrollNext}
        onClick={scrollNext}
        ref={ref}
        {...props}
      >
        {children || <ArrowRight />}
        <span className="sr-only">Next slide</span>
      </button>
    );
  },
);

CarouselNextIndicator.displayName = 'CarouselNextIndicator';

const CarouselPagination = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, onClick, ...props }, ref) => {
    const { api } = useCarousel();
    const isHidden = api?.scrollSnapList().length === 1;

    return (
      <div
        aria-label="Slides"
        className={cn(
          'no-wrap absolute bottom-1 flex w-full items-center justify-center gap-2',
          isHidden && 'hidden',
        )}
        ref={ref}
        role="tablist"
        {...props}
      >
        {children}
      </div>
    );
  },
);

CarouselPagination.displayName = 'CarouselPagination';

const CarouselPaginationTab = forwardRef<
  ElementRef<'button'>,
  ComponentPropsWithRef<'button'> & { index: number }
>(({ children, className, index, ...props }, ref) => {
  const { api, selectedSnapIndex } = useCarousel();

  const isSelected = selectedSnapIndex === index;

  const onClick = useCallback(() => {
    if (!api) {
      return;
    }

    api.scrollTo(index);
  }, [api, index]);

  return (
    <button
      aria-selected={isSelected}
      className={cn(
        "h-7 w-7 p-0.5 after:block after:h-0.5 after:w-full after:bg-gray-400 after:content-[''] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
        isSelected && 'after:bg-black',
        className,
      )}
      onClick={onClick}
      ref={ref}
      role="tab"
      {...props}
    />
  );
});

CarouselPaginationTab.displayName = 'CarouselPaginationTab';

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPreviousIndicator,
  CarouselNextIndicator,
  CarouselPagination,
  CarouselPaginationTab,
};
