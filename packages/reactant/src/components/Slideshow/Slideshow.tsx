import useEmblaCarousel, { UseEmblaCarouselType } from 'embla-carousel-react';
import {
  ComponentPropsWithRef,
  createContext,
  ElementRef,
  forwardRef,
  useCallback,
  useContext,
  useImperativeHandle,
  useRef,
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
