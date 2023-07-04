import { clsx } from 'clsx';
import { KeenSliderInstance, KeenSliderPlugin, useKeenSlider } from 'keen-slider/react';
import debounce from 'lodash.debounce';
import Image from 'next/image';
import React, { MutableRefObject, useCallback, useEffect, useState } from 'react';

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
  const [activeIdx, setActiveIdx] = useState(0);
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

  const [thumbnailRef, thumbnailInstanceRef] = useKeenSlider<HTMLDivElement>({
    selector: ':scope > div',
    initial: 0,
    slides: {
      perView: 5,
      spacing: 8,
    },
  });

  useEffect(() => {
    if (!instanceRef.current) return;

    instanceRef.current.on('animationStarted', (slider) => {
      const next = slider.track.absToRel(slider.animator.targetIdx || 0);

      setActiveIdx(next);

      thumbnailInstanceRef.current?.moveToIdx(
        Math.min(thumbnailInstanceRef.current?.track.details.maxIdx, next),
      );
    });
  }, [instanceRef]);

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
    <div className={clsx(className, 'min-h-[40px] w-full')}>
      <div
        className="focus:outline-0"
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
          className="relative z-10 flex aspect-square w-full touch-pan-y select-none items-stretch overflow-hidden focus:outline-0"
          ref={sliderRef}
        >
          {slides.map((slide, index) => (
            <div className="aspect-square h-full min-w-full" key={index}>
              {slide.image && (
                <Image
                  alt={slide.imageAlt}
                  className="w-full object-cover"
                  fill
                  priority
                  src={slide.image.url}
                />
              )}
            </div>
          ))}
        </div>

        <div
          className="mt-6 flex w-full touch-pan-y select-none items-stretch overflow-hidden focus:outline-0"
          ref={thumbnailRef}
        >
          {slides.map((slide, index) => (
            <div
              className={clsx(
                'relative aspect-square w-1/5 min-w-[20%] bg-gray-100',
                index === activeIdx && 'border-2 border-blue-primary',
              )}
              onClick={() => instanceRef.current?.moveToIdx(index)}
              key={index}
            >
              {slide.image && (
                <Image
                  alt={slide.imageAlt}
                  key={index}
                  fill
                  className="object-cover"
                  src={slide.image.url}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      {slides.length === 0 && <Warning className={className}>There are no product images</Warning>}
    </div>
  );
}
