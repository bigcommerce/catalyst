import useEmblaCarousel, { UseEmblaCarouselType } from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  ComponentPropsWithRef,
  createContext,
  ElementRef,
  forwardRef,
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { cs } from '../../utils/cs';

const SlideshowContext = createContext<UseEmblaCarouselType>([() => null, undefined]);

export const Slideshow = forwardRef<ElementRef<'section'>, ComponentPropsWithRef<'section'>>(
  ({ children, className, ...props }, ref) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

    return (
      <SlideshowContext.Provider value={[emblaRef, emblaApi]}>
        <section
          aria-label="Interactive slide show"
          aria-roledescription="carousel"
          className={cs('relative overflow-hidden', className)}
          ref={ref}
          {...props}
        >
          {children}
        </section>
      </SlideshowContext.Provider>
    );
  },
);

Slideshow.displayName = 'Slideshow';

type ForwardedRef = ElementRef<'div'> | null;

export const SlideshowContent = forwardRef<ForwardedRef, ComponentPropsWithRef<'ul'>>(
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

    return (
      <div ref={refCallback}>
        <ul aria-live="off" className={cs('flex', className)} {...props}>
          {children}
        </ul>
      </div>
    );
  },
);

SlideshowContent.displayName = 'SlideshowContent';

export const SlideshowSlide = forwardRef<ElementRef<'li'>, ComponentPropsWithRef<'li'>>(
  ({ children, className, ...props }, ref) => (
    <li
      aria-roledescription="slide"
      className={cs('min-w-0 shrink-0 grow-0 basis-full', className)}
      ref={ref}
      role="group"
      {...props}
    >
      {children}
    </li>
  ),
);

SlideshowSlide.displayName = 'SlideshowSlide';

export const SlideshowControls = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => {
    const [, emblaApi] = useContext(SlideshowContext);

    if (!emblaApi || emblaApi.scrollSnapList().length <= 1) {
      return null;
    }

    return (
      <div
        className={cs('absolute bottom-12 left-12 flex items-center gap-4', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);

SlideshowControls.displayName = 'SlideshowControls';

export const SlideshowNextIndicator = forwardRef<
  ElementRef<'button'>,
  ComponentPropsWithRef<'button'>
>(({ children, className, onClick, ...props }, ref) => {
  const [, emblaApi] = useContext(SlideshowContext);

  const scrollNext = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    if (emblaApi) emblaApi.scrollNext();
    if (onClick) onClick(e);
  };

  return (
    <button
      aria-label="Next slide"
      className={cs(
        'focus:ring-primary-blue/20 inline-flex h-12 w-12 items-center justify-center focus:outline-none focus:ring-4',
        className,
      )}
      onClick={scrollNext}
      ref={ref}
      {...props}
    >
      {children || <ArrowRight />}
    </button>
  );
});

SlideshowNextIndicator.displayName = 'SlideshowNextIndicator';

export const SlideshowPreviousIndicator = forwardRef<
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
      aria-label="Previous slide"
      className={cs(
        'focus:ring-primary-blue/20 inline-flex h-12 w-12 items-center justify-center focus:outline-none focus:ring-4',
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
        activeIndex,
        totalSlides,
      }: {
        activeIndex: number;
        totalSlides: number;
      }) => React.ReactNode)
    | React.ReactNode;
}

export const SlideshowPagination = forwardRef<ElementRef<'span'>, SlideshowPaginationProps>(
  ({ children, className, ...props }, ref) => {
    const [, emblaApi] = useContext(SlideshowContext);

    const [activeIndex, setActiveIndex] = useState(0);
    const [totalSlides, setTotalSlides] = useState(0);

    useEffect(() => {
      if (!emblaApi) return;

      // We must reinitialize Embla on client-side navigation
      // E.g., navigating from Homepage to PDP to Homepage
      emblaApi.reInit();

      const initialize = () => {
        setTotalSlides(emblaApi.scrollSnapList().length);
        setActiveIndex(emblaApi.selectedScrollSnap() + 1);
      };

      const onSelect = () => {
        setActiveIndex(emblaApi.selectedScrollSnap() + 1);
      };

      emblaApi.on('slidesInView', initialize);
      emblaApi.on('reInit', initialize);
      emblaApi.on('select', onSelect);
    }, [emblaApi]);

    if (typeof children === 'function') {
      return (
        <span className={cs('font-semibold', className)} ref={ref} {...props}>
          {children({ activeIndex, totalSlides })}
        </span>
      );
    }

    return (
      <span className={cs('font-semibold', className)} ref={ref} {...props}>
        {activeIndex} of {totalSlides}
      </span>
    );
  },
);

SlideshowPagination.displayName = 'SlideshowPagination';
