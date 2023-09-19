import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel, { UseEmblaCarouselType } from 'embla-carousel-react';
import { ComponentPropsWithRef, createContext, ElementRef, forwardRef, useContext } from 'react';

import { cs } from '../../utils/cs';

const SlideshowEmblaContext = createContext<UseEmblaCarouselType>([() => null, undefined]);

export const SlideshowEmbla = forwardRef<ElementRef<'section'>, ComponentPropsWithRef<'section'>>(
  ({ children, className, ...props }, ref) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);

    return (
      <SlideshowEmblaContext.Provider value={[emblaRef, emblaApi]}>
        <section
          aria-label="Interactive slide show"
          aria-roledescription="carousel"
          className={cs('overflow-hidden', className)}
          ref={ref}
          {...props}
        >
          {children}
        </section>
      </SlideshowEmblaContext.Provider>
    );
  },
);

export const SlideshowEmblaContent = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'ul'>>(
  ({ children, className, ...props }, ref) => {
    const [emblaRef] = useContext(SlideshowEmblaContext);

    return (
      <div ref={ref}>
        <div ref={emblaRef}>
          <ul aria-live="off" className={cs('flex', className)} {...props}>
            {children}
          </ul>
        </div>
      </div>
    );
  },
);

export const SlideshowEmblaSlide = forwardRef<ElementRef<'li'>, ComponentPropsWithRef<'li'>>(
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
