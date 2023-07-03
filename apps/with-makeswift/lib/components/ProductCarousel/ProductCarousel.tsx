import { clsx } from 'clsx';
import { useKeenSlider } from 'keen-slider/react';
import debounce from 'lodash.debounce';
import { ArrowLeft, ArrowRight, Pause } from 'lucide-react';
import Image from 'next/image';
import React, { MouseEvent, useCallback, useEffect, useState } from 'react';

import { Warning } from '../Warning';

interface Slide {
  image?: { url: string; dimensions: { width: number; height: number } };
  imageAlt: string;
}

interface Props {
  className?: string;
  loop?: boolean;
  autoplay?: number;
  slides: Slide[];
}

export function ProductCarousel({ className, slides, loop = true, autoplay = 0 }: Props) {
  const [, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop,
      slides: { perView: 1, origin: 'center' },
      selector: ':scope > div',
      initial: 0,
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel);
      },
      created() {
        setLoaded(true);
      },
    },
    [
      // resize
      (slider) => {
        const debouncedUpdate = debounce(() => slider.update(), 100);
        const observer = new ResizeObserver(() => debouncedUpdate());

        slider.on('created', () => observer.observe(slider.container));
        slider.on('destroyed', () => observer.unobserve(slider.container));
      },
    ],
  );

  useEffect(() => {
    if (autoplay > 0) {
      const intervalId = setInterval(() => instanceRef.current?.next(), autoplay * 1000);

      return () => clearInterval(intervalId);
    }
  }, [instanceRef, autoplay]);

  const prevSlide = useCallback(() => {
    const slider = instanceRef.current;

    if (!slider) {
      return;
    }

    slider.moveToIdx(slider.track.details.rel - 1);
  }, [instanceRef]);

  const nextSlide = useCallback(() => {
    const slider = instanceRef.current;

    if (!slider) {
      return;
    }

    slider.moveToIdx(slider.track.details.rel + 1);
  }, [instanceRef]);

  return (
    <div className={className}>
      {slides.length > 0 ? (
        <div
          className="relative focus:outline-0"
          onKeyDown={(e) => {
            switch (e.key) {
              default:
                break;

              case 'Left':
              case 'ArrowLeft':
                prevSlide();
                break;

              case 'Right':
              case 'ArrowRight':
                nextSlide();
                break;
            }
          }}
          role="button"
          tabIndex={-1}
        >
          <div
            className="relative z-10 flex w-full touch-pan-y select-none items-stretch overflow-hidden focus:outline-0"
            ref={sliderRef}
          >
            {slides.map((slide, index) => (
              <div className="min-w-full bg-gray-500" key={index}>
                {slide.image && (
                  <Image
                    alt={slide.imageAlt}
                    className="aspect-square object-cover"
                    fill
                    priority
                    src={slide.image.url}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Warning className={className}>There are no product images</Warning>
      )}
    </div>
  );
}
