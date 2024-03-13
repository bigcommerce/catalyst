import useEmblaCarousel, { UseEmblaCarouselType } from 'embla-carousel-react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import {
  Children,
  ComponentPropsWithRef,
  createContext,
  Dispatch,
  DispatchWithoutAction,
  ElementRef,
  forwardRef,
  MouseEvent,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
  useState,
} from 'react';

import { cn } from '~/lib/utils';

type SetState<T> = Dispatch<SetStateAction<T>>;

const SlideshowContext = createContext<UseEmblaCarouselType>([() => null, undefined]);
const SlideIndexContext = createContext<[number, number]>([0, 0]);
const AutoplayContext = createContext<[boolean, DispatchWithoutAction]>([false, () => null]);
const ActiveSlideContext = createContext<[number, SetState<number>]>([0, () => null]);

interface SlideshowProps extends ComponentPropsWithRef<'section'> {
  interval?: number;
}

const Slideshow = forwardRef<ElementRef<'section'>, SlideshowProps>(
  ({ children, className, interval = 15_000, ...props }, ref) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

    const [isHoverPaused, setIsHoverPaused] = useState(false);
    const [isPaused, togglePaused] = useReducer((val: boolean) => !val, false);

    const [activeSlide, setActiveSlide] = useState(0);

    const [visibilityState, setVisibilityState] = useState<
      DocumentVisibilityState | Omit<string, 'hidden' | 'visible'>
    >('');

    useEffect(() => {
      const autoplay = setInterval(() => {
        if (isPaused) return;
        if (isHoverPaused) return;
        if (!emblaApi) return;
        if (visibilityState === 'hidden') return;

        emblaApi.scrollNext();
      }, interval);

      return () => clearInterval(autoplay);
    }, [emblaApi, isHoverPaused, interval, isPaused, visibilityState]);

    useEffect(() => {
      window.addEventListener('visibilitychange', () => {
        setVisibilityState(document.visibilityState);
      });

      return () => window.removeEventListener('visibilitychange', () => null);
    }, [visibilityState]);

    return (
      <SlideshowContext.Provider value={[emblaRef, emblaApi]}>
        <AutoplayContext.Provider value={[isPaused, togglePaused]}>
          <ActiveSlideContext.Provider value={[activeSlide, setActiveSlide]}>
            <section
              aria-label="Interactive slide show"
              aria-roledescription="carousel"
              className={cn(
                'relative -mx-6 overflow-hidden sm:-mx-10 md:-mx-12 lg:mx-0',
                className,
              )}
              onBlur={() => setIsHoverPaused(false)}
              onFocus={() => setIsHoverPaused(true)}
              onMouseEnter={() => setIsHoverPaused(true)}
              onMouseLeave={() => setIsHoverPaused(false)}
              ref={ref}
              {...props}
            >
              {children}
            </section>
          </ActiveSlideContext.Provider>
        </AutoplayContext.Provider>
      </SlideshowContext.Provider>
    );
  },
);

Slideshow.displayName = 'Slideshow';

type ForwardedRef = ElementRef<'div'> | null;

const SlideshowContent = forwardRef<ForwardedRef, ComponentPropsWithRef<'ul'>>(
  ({ children, className, ...props }, ref) => {
    const mutableRef = useRef<ForwardedRef>(null);
    const [emblaRef] = useContext(SlideshowContext);

    useImperativeHandle<ForwardedRef, ForwardedRef>(ref, () => mutableRef.current, []);

    const refCallback = useCallback(
      (current: HTMLDivElement) => {
        emblaRef(current);
        mutableRef.current = current;
      },
      [emblaRef],
    );

    const unindexedSlides = Children.toArray(children);

    return (
      <div ref={refCallback}>
        <ul className={cn('flex', className)} id="slideshow-slides" {...props}>
          {unindexedSlides.map((indexedSlide, index) => (
            <SlideIndexContext.Provider key={index} value={[index, unindexedSlides.length]}>
              {indexedSlide}
            </SlideIndexContext.Provider>
          ))}
        </ul>
      </div>
    );
  },
);

SlideshowContent.displayName = 'SlideshowContent';

const SlideshowSlide = forwardRef<ElementRef<'li'>, ComponentPropsWithRef<'li'>>(
  ({ children, className, ...props }, ref) => {
    const [activeSlide] = useContext(ActiveSlideContext);
    const [thisSlideIndex, totalSlides] = useContext(SlideIndexContext);

    const activeSlideIndex = activeSlide - 1;

    return (
      <li
        aria-label={`${thisSlideIndex + 1} of ${totalSlides}`}
        aria-roledescription="slide"
        className={cn('min-w-0 shrink-0 grow-0 basis-full', className)}
        // @ts-expect-error https://github.com/DefinitelyTyped/DefinitelyTyped/pull/60822
        inert={thisSlideIndex === activeSlideIndex ? null : 'true'}
        ref={ref}
        {...props}
      >
        {children}
      </li>
    );
  },
);

SlideshowSlide.displayName = 'SlideshowSlide';

const SlideshowControls = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => {
    const [, emblaApi] = useContext(SlideshowContext);

    if (!emblaApi || emblaApi.scrollSnapList().length <= 1) {
      return null;
    }

    return (
      <div
        className={cn('absolute bottom-12 start-12 flex items-center gap-4', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);

SlideshowControls.displayName = 'SlideshowControls';

interface SlideshowAutoplayControlProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
  children?: (({ isPaused }: { isPaused: boolean }) => React.ReactNode) | React.ReactNode;
}

const SlideshowAutoplayControl = forwardRef<ElementRef<'button'>, SlideshowAutoplayControlProps>(
  ({ children, className, onClick, ...props }, ref) => {
    const [isPaused, togglePaused] = useContext(AutoplayContext);

    const renderChildrenWithFallback = () => {
      if (typeof children === 'function') {
        return children({ isPaused });
      }

      return isPaused ? <Play /> : <Pause />;
    };

    return (
      <button
        aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'}
        className={cn(
          'inline-flex h-12 w-12 items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
          className,
        )}
        onClick={(e) => {
          togglePaused();

          if (onClick) {
            onClick(e);
          }
        }}
        ref={ref}
        {...props}
      >
        {renderChildrenWithFallback()}
      </button>
    );
  },
);

SlideshowAutoplayControl.displayName = 'SlideshowAutoplayControl';

const SlideshowNextIndicator = forwardRef<ElementRef<'button'>, ComponentPropsWithRef<'button'>>(
  ({ children, className, onClick, ...props }, ref) => {
    const [, emblaApi] = useContext(SlideshowContext);

    const scrollNext = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      if (emblaApi) emblaApi.scrollNext();
      if (onClick) onClick(e);
    };

    return (
      <button
        aria-controls="slideshow-slides"
        aria-label="Next slide"
        className={cn(
          'inline-flex h-12 w-12 items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
          className,
        )}
        onClick={scrollNext}
        ref={ref}
        {...props}
      >
        {children || <ArrowRight />}
      </button>
    );
  },
);

SlideshowNextIndicator.displayName = 'SlideshowNextIndicator';

const SlideshowPreviousIndicator = forwardRef<
  ElementRef<'button'>,
  ComponentPropsWithRef<'button'>
>(({ children, className, onClick, ...props }, ref) => {
  const [, emblaApi] = useContext(SlideshowContext);

  const scrollPrev = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    if (emblaApi) emblaApi.scrollPrev();
    if (onClick) onClick(e);
  };

  return (
    <button
      aria-controls="slideshow-slides"
      aria-label="Previous slide"
      className={cn(
        'inline-flex h-12 w-12 items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
        className,
      )}
      onClick={scrollPrev}
      ref={ref}
      {...props}
    >
      {children || <ArrowLeft />}
    </button>
  );
});

SlideshowPreviousIndicator.displayName = 'SlideshowPreviousIndicator';

interface SlideshowPaginationProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  children?:
    | (({
        activeSlide,
        totalSlides,
      }: {
        activeSlide: number;
        totalSlides: number;
      }) => React.ReactNode)
    | React.ReactNode;
}

const SlideshowPagination = forwardRef<ElementRef<'span'>, SlideshowPaginationProps>(
  ({ children, className, ...props }, ref) => {
    const [, emblaApi] = useContext(SlideshowContext);
    const [activeSlide, setActiveSlide] = useContext(ActiveSlideContext);
    const [isPaused] = useContext(AutoplayContext);

    const [totalSlides, setTotalSlides] = useState(0);

    const renderChildrenWithFallback = () => {
      if (typeof children === 'function') {
        return children({ activeSlide, totalSlides });
      }

      return (
        <>
          {activeSlide} of {totalSlides}
        </>
      );
    };

    useEffect(() => {
      if (!emblaApi) return;

      // We must reinitialize Embla on client-side navigation
      // E.g., navigating from Homepage to PDP to Homepage
      emblaApi.reInit();

      const initialize = () => {
        setTotalSlides(emblaApi.scrollSnapList().length);
        setActiveSlide(emblaApi.selectedScrollSnap() + 1);
      };

      const onSelect = () => {
        setActiveSlide(emblaApi.selectedScrollSnap() + 1);
      };

      emblaApi.on('slidesInView', initialize);
      emblaApi.on('reInit', initialize);
      emblaApi.on('select', onSelect);
    }, [emblaApi, setActiveSlide]);

    return (
      <span
        aria-atomic="false"
        aria-live={isPaused ? 'polite' : 'off'}
        className={cn('font-semibold', className)}
        ref={ref}
        {...props}
      >
        {renderChildrenWithFallback()}
      </span>
    );
  },
);

SlideshowPagination.displayName = 'SlideshowPagination';

export {
  Slideshow,
  SlideshowContent,
  SlideshowSlide,
  SlideshowControls,
  SlideshowAutoplayControl,
  SlideshowNextIndicator,
  SlideshowPreviousIndicator,
  SlideshowPagination,
};
