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
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { cn } from '~/lib/utils';

const CarouselContext = createContext<UseEmblaCarouselType>([() => null, undefined]);

const Carousel = forwardRef<ElementRef<'section'>, ComponentPropsWithRef<'section'>>(
  ({ children, className, ...props }, ref) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

    return (
      <CarouselContext.Provider value={[emblaRef, emblaApi]}>
        <section
          aria-roledescription="carousel"
          className={cn('relative -m-2 overflow-hidden p-2', className)}
          ref={ref}
          {...props}
        >
          {children}
        </section>
      </CarouselContext.Provider>
    );
  },
);

Carousel.displayName = 'Carousel';

type ForwardedRef = ElementRef<'div'> | null;

const CarouselContent = forwardRef<ForwardedRef, ComponentPropsWithRef<'ul'>>(
  ({ children, className, ...props }, ref) => {
    const mutableRef = useRef<ForwardedRef>(null);
    const [emblaRef] = useContext(CarouselContext);

    useImperativeHandle<ForwardedRef, ForwardedRef>(ref, () => mutableRef.current, []);

    const refCallback = useCallback(
      (current: ForwardedRef) => {
        emblaRef(current);
        mutableRef.current = current;
      },
      [emblaRef],
    );

    return (
      <div ref={refCallback}>
        <ul aria-live="polite" className={cn('mb-16 mt-8 flex lg:mt-10', className)} {...props}>
          {children}
        </ul>
      </div>
    );
  },
);

CarouselContent.displayName = 'CarouselContent';

interface CarouselSlideProps extends ComponentPropsWithRef<'li'> {
  index: number;
}

const CarouselSlide = forwardRef<ElementRef<'li'>, CarouselSlideProps>(
  ({ children, className, index, ...props }, ref) => {
    const [, emblaApi] = useContext(CarouselContext);
    const [slidesInView, setSlidesInView] = useState<number[]>([0]);

    useEffect(() => {
      if (!emblaApi) return;

      emblaApi.on('slidesInView', () => {
        setSlidesInView(emblaApi.slidesInView());
      });
    }, [emblaApi]);

    return (
      <li
        aria-roledescription="slide"
        className={cn(
          'mx-6 grid min-w-0 flex-shrink-0 flex-grow-0 basis-full grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8',
          !slidesInView.includes(index) && 'invisible',
          className,
        )}
        ref={ref}
        role="tabpanel"
        {...props}
      >
        {children}
      </li>
    );
  },
);

CarouselSlide.displayName = 'CarouselSlide';

const CarouselPreviousIndicator = forwardRef<ElementRef<'button'>, ComponentPropsWithRef<'button'>>(
  ({ children, className, onClick, ...props }, ref) => {
    const [, emblaApi] = useContext(CarouselContext);
    const [isHidden, setIsHidden] = useState(false);

    const scrollPrev = useCallback(() => {
      if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    useEffect(() => {
      if (emblaApi) setIsHidden(emblaApi.scrollSnapList().length <= 1);
    }, [emblaApi]);

    return (
      <button
        aria-label="Previous products"
        className={cn(
          'inline-flex h-12 w-12 items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-primary/20',
          isHidden && 'hidden',
          className,
        )}
        onClick={(e) => {
          scrollPrev();

          if (onClick) {
            onClick(e);
          }
        }}
        ref={ref}
        {...props}
      >
        {children || <ArrowLeft />}
      </button>
    );
  },
);

CarouselPreviousIndicator.displayName = 'CarouselPreviousIndicator';

const CarouselNextIndicator = forwardRef<ElementRef<'button'>, ComponentPropsWithRef<'button'>>(
  ({ children, className, onClick, ...props }, ref) => {
    const [, emblaApi] = useContext(CarouselContext);
    const [isHidden, setIsHidden] = useState(false);

    const scrollNext = useCallback(() => {
      if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    useEffect(() => {
      if (emblaApi) setIsHidden(emblaApi.scrollSnapList().length <= 1);
    }, [emblaApi]);

    return (
      <button
        aria-label="Next products"
        className={cn(
          'inline-flex h-12 w-12 items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-primary/20',
          isHidden && 'hidden',
          className,
        )}
        onClick={(e) => {
          scrollNext();

          if (onClick) {
            onClick(e);
          }
        }}
        ref={ref}
        {...props}
      >
        {children || <ArrowRight />}
      </button>
    );
  },
);

CarouselNextIndicator.displayName = 'CarouselNextIndicator';

interface CarouselPaginationProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  children?:
    | (({
        selectedIndex,
        scrollTo,
      }: {
        selectedIndex: number;
        scrollTo: (index: number) => void | undefined;
      }) => React.ReactNode)
    | React.ReactNode;
}

const CarouselPagination = forwardRef<ElementRef<'div'>, CarouselPaginationProps>(
  ({ children, className, onClick, ...props }, ref) => {
    const [, emblaApi] = useContext(CarouselContext);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const onInit = useCallback(() => {
      if (emblaApi) setScrollSnaps(emblaApi.scrollSnapList());
    }, [emblaApi]);

    const scrollTo = useCallback(
      (index: number) => emblaApi && emblaApi.scrollTo(index),
      [emblaApi],
    );

    const onSelect = useCallback(() => {
      if (emblaApi) setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
      if (!emblaApi) return;

      onInit();
      emblaApi.on('reInit', onInit);
      emblaApi.on('select', onSelect);
    }, [emblaApi, onInit, onSelect]);

    if (scrollSnaps.length <= 1) {
      return null;
    }

    if (typeof children === 'function') {
      return (
        <div
          aria-label="Slides"
          className={cn('no-wrap absolute bottom-1 flex w-full items-center justify-center gap-2')}
          ref={ref}
          role="tablist"
          {...props}
        >
          {children({ selectedIndex, scrollTo })}
        </div>
      );
    }

    return null;
  },
);

CarouselPagination.displayName = 'CarouselPagination';

interface CarouselPaginationTabProps extends ComponentPropsWithRef<'button'> {
  isSelected: boolean;
}

const CarouselPaginationTab = forwardRef<ElementRef<'button'>, CarouselPaginationTabProps>(
  ({ children, className, isSelected, ...props }, ref) => {
    return (
      <button
        aria-selected={isSelected}
        className={cn(
          "h-7 w-7 p-0.5 after:block after:h-0.5 after:w-full after:bg-gray-400 after:content-[''] focus:outline-none focus:ring-4 focus:ring-blue-primary/20",
          isSelected && 'after:bg-black',
          className,
        )}
        ref={ref}
        role="tab"
        {...props}
      />
    );
  },
);

CarouselPaginationTab.displayName = 'CarouselPaginationTab';

export {
  Carousel,
  CarouselContent,
  CarouselSlide,
  CarouselPreviousIndicator,
  CarouselNextIndicator,
  CarouselPagination,
  CarouselPaginationTab,
};
