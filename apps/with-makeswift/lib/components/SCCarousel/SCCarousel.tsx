import { clsx } from 'clsx';
import { useKeenSlider } from 'keen-slider/react';
import debounce from 'lodash.debounce';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import Image from 'next/image';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';

import { Button } from '@components/Button';

import { Warning } from '../Warning';
import { SCButton } from '@components/SCButton';

interface Slide {
  image?: { url: string; dimensions: { width: number; height: number } };
  imageAlt: string;
  children?: ReactNode;
}

interface Props {
  className?: string;
  loop?: boolean;
  autoplay?: number;
  slides: Slide[];
}

export function SCCarousel({ className, slides, loop = true, autoplay = 0 }: Props) {
  const [isAutoplaying, setIsAutplaying] = useState(true);
  const [, setCurrentSlide] = useState(0);
  const [, setLoaded] = useState(false);
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
    if (isAutoplaying && autoplay > 0) {
      const intervalId = setInterval(() => instanceRef.current?.next(), autoplay * 1000);

      return () => clearInterval(intervalId);
    }
  }, [instanceRef, autoplay, isAutoplaying]);

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
    <div className={clsx(className, 'text-white')}>
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
            className="relative flex w-full touch-pan-y select-none items-stretch overflow-hidden focus:outline-0"
            ref={sliderRef}
          >
            {slides.map((slide, index) => (
              <div
                className="min-w-full bg-gray-200 px-6 pt-8 pb-40 md:min-h-[680px] md:px-8 md:pt-12 md:pb-44 lg:px-16 lg:pt-16 lg:pb-64"
                key={index}
              >
                {slide.children}
                {slide.image && (
                  <Image
                    alt={slide.imageAlt}
                    className="absolute inset-0 -z-10 object-cover"
                    fill
                    priority
                    src={slide.image.url}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="absolute bottom-6 left-6 flex items-center gap-x-1 md:bottom-12 md:left-12 lg:bottom-16 lg:left-16">
            <SCButton aria-label="Previous slide" onClick={prevSlide} variant="subtle">
              <ArrowLeft strokeWidth={1.5} />
            </SCButton>

            <SCButton aria-label="Next slide" onClick={nextSlide} variant="subtle">
              <ArrowRight strokeWidth={1.5} />
            </SCButton>

            <SCButton
              aria-label="Toggle carousel autoplay"
              onClick={() => setIsAutplaying(!isAutoplaying)}
              variant="subtle"
            >
              {isAutoplaying ? <Pause strokeWidth={1.5} /> : <Play strokeWidth={1.5} />}
            </SCButton>
          </div>
        </div>
      ) : (
        <Warning className={className}>There are no slides</Warning>
      )}
    </div>
  );
}
