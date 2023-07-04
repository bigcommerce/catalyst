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

function ThumbnailPlugin(mainRef: MutableRefObject<KeenSliderInstance | null>): KeenSliderPlugin {
  return (slider) => {
    function removeActive() {
      slider.slides.forEach((slide) => {
        slide.classList.remove('active');
      });
    }
    function addActive(idx: number) {
      slider.slides[idx].classList.add('active');
    }

    function addClickEvents() {
      slider.slides.forEach((slide, idx) => {
        slide.addEventListener('click', () => {
          if (mainRef.current) mainRef.current.moveToIdx(idx);
        });
      });
    }

    slider.on('created', () => {
      if (!mainRef.current) return;
      addActive(slider.track.details.rel);
      addClickEvents();
      mainRef.current.on('animationStarted', (main) => {
        removeActive();
        const next = main.animator.targetIdx || 0;
        addActive(main.track.absToRel(next));
        slider.moveToIdx(Math.min(slider.track.details.maxIdx, next));
      });
    });
  };
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

  const [thumbnailRef] = useKeenSlider<HTMLDivElement>(
    {
      initial: 0,
      slides: {
        perView: 4,
        spacing: 8,
      },
    },
    [ThumbnailPlugin(instanceRef)],
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
    <div className={clsx(className, 'min-h-[40px] w-full')}>
      {slides.length > 0 ? (
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
            className="flex w-full touch-pan-y select-none items-stretch overflow-hidden focus:outline-0"
            ref={thumbnailRef}
          >
            {slides.map((slide, index) => (
              <div
                className="thumbnail relative aspect-square w-1/5 min-w-[20%] bg-gray-100"
                key={index}
              >
                {slide.image && <Image alt={slide.imageAlt} fill src={slide.image.url} />}
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
