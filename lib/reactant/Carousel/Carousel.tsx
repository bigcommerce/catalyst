import clsx from 'clsx';
import { useKeenSlider } from 'keen-slider/react';
import debounce from 'lodash.debounce';
import { ArrowLeft, ArrowRight, Pause } from 'lucide-react';
import Image from 'next/image';
import React, { MouseEvent, useCallback, useEffect, useState } from 'react';

import { Warning } from '../Warning';

interface Slide {
  title?: string;
  text?: string;
  image?: { url: string; dimensions: { width: number; height: number } };
  imageAlt: string;
  buttonText: string;
  link?: {
    target?: '_self' | '_blank';
    href: string;
    onClick(event: MouseEvent): void;
  };
  buttonColor?: string;
  buttonTextColor?: string;
}

interface Props {
  className?: string;
  loop?: boolean;
  autoplay?: number;
  slides: Slide[];
}

export function Carousel({ className, slides, loop = true, autoplay = 0 }: Props) {
  const SLIDER_COUNT = slides.length;
  const [, setCurrentSlide] = React.useState(0);
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
            className="relative z-10 flex w-full touch-pan-y select-none items-stretch overflow-hidden focus:outline-0"
            ref={sliderRef}
          >
            {slides.map((slide, index) => (
              <div
                className="relative min-w-full bg-gray-500 px-6 pb-32 pt-44 md:px-20 md:pb-44 md:pt-28 lg:px-24 lg:pb-48 lg:pt-36"
                key={index}
              >
                <div className="max-w-xl">
                  <h1 className="leading-0 m-0 text-h2 font-black text-current drop-shadow-md md:text-h1">
                    {slide.title}
                  </h1>
                  <p className="mt-4 text-base text-current drop-shadow-md">{slide.text}</p>
                  <a
                    {...slide.link}
                    className="mt-10 block px-8 py-3 text-center text-base font-semibold outline-none sm:inline-block"
                    style={{ backgroundColor: slide.buttonColor, color: slide.buttonTextColor }}
                  >
                    {slide.buttonText}
                  </a>
                </div>
                {slide.image && (
                  <Image
                    alt={slide.imageAlt}
                    className="absolute inset-0 -z-10 object-cover"
                    fill
                    src={slide.image.url}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="absolute bottom-6 left-6 z-10 flex items-center md:bottom-12 md:left-20 lg:bottom-16 lg:left-24 [&>button]:p-4 [&>button]:outline-none [&_svg]:drop-shadow-md">
            <button className="mr-4">
              <Pause />
            </button>

            <button onClick={prevSlide}>
              <ArrowLeft />
            </button>

            {loaded && instanceRef.current && (
              <p className="w-16 text-center text-base font-semibold">
                {instanceRef.current.track.details.rel + 1} / {SLIDER_COUNT}
              </p>
            )}

            <button onClick={nextSlide}>
              <ArrowRight />
            </button>
          </div>
        </div>
      ) : (
        <Warning className={className}>There are no slides</Warning>
      )}
    </div>
  );
}
