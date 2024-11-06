'use client';

import { clsx } from 'clsx';
import { EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import useEmblaCarousel from 'embla-carousel-react';
import { Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/vibes/soul/primitives/button';
import { BcImage } from '~/components/bc-image';

interface Link {
  label: string;
  href: string;
}

interface Image {
  alt: string;
  blurDataUrl?: string;
  src: string;
}

export interface Slide {
  title: string;
  description?: string;
  image?: Image;
  cta?: Link;
}

interface Props {
  slides: Slide[];
  interval?: number;
  className?: string;
}

interface UseProgressButtonType {
  selectedIndex: number;
  scrollSnaps: number[];
  onProgressButtonClick: (index: number) => void;
}

const useProgressButton = (
  emblaApi: EmblaCarouselType | undefined,
  onButtonClick?: (emblaApi: EmblaCarouselType) => void,
): UseProgressButtonType => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onProgressButtonClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
      if (onButtonClick) onButtonClick(emblaApi);
    },
    [emblaApi, onButtonClick],
  );

  const onInit = useCallback((emblaAPI: EmblaCarouselType) => {
    setScrollSnaps(emblaAPI.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaAPI: EmblaCarouselType) => {
    setSelectedIndex(emblaAPI.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);

    emblaApi.on('reInit', onInit).on('reInit', onSelect).on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  return {
    selectedIndex,
    scrollSnaps,
    onProgressButtonClick,
  };
};

export const Slideshow = function Slideshow({ slides, interval = 5000, className }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 20 }, [
    Autoplay({ delay: interval }),
    Fade(),
  ]);
  const { selectedIndex, scrollSnaps, onProgressButtonClick } = useProgressButton(emblaApi);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  const toggleAutoplay = useCallback(() => {
    const autoplay = emblaApi?.plugins().autoplay;

    if (!autoplay) return;

    const playOrStop = autoplay.isPlaying() ? autoplay.stop : autoplay.play;

    playOrStop();
  }, [emblaApi]);

  const resetAutoplay = useCallback(() => {
    const autoplay = emblaApi?.plugins().autoplay;

    if (!autoplay) return;

    autoplay.reset();
  }, [emblaApi]);

  useEffect(() => {
    const autoplay = emblaApi?.plugins().autoplay;

    if (!autoplay) return;

    setIsPlaying(autoplay.isPlaying());
    emblaApi
      .on('autoplay:play', () => {
        setIsPlaying(true);
        setPlayCount(playCount + 1);
      })
      .on('autoplay:stop', () => {
        setIsPlaying(false);
      })
      .on('reInit', () => {
        setIsPlaying(autoplay.isPlaying());
      });
  }, [emblaApi, playCount]);

  return (
    <section
      className={clsx(
        'bg-primary-shadow relative h-dvh max-h-[880px] overflow-hidden @container',
        className,
      )}
    >
      <div className="h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map(({ title, description, image, cta }, idx) => {
            return (
              <div className="relative h-full w-full min-w-0 shrink-0 grow-0 basis-full" key={idx}>
                <div className="from-foreground text-background absolute bottom-0 left-1/2 z-10 w-full -translate-x-1/2 bg-gradient-to-t to-transparent pb-5 pt-20">
                  <div className="mx-auto max-w-screen-2xl px-3 pb-8 @xl:px-6 @5xl:px-20">
                    <h1 className="font-heading mb-2 text-5xl font-medium leading-none @2xl:text-8xl">
                      {title}
                    </h1>
                    {description != null && description !== '' && (
                      <p className="mb-4 max-w-xl">{description}</p>
                    )}
                    {cta != null && cta.href !== '' && cta.label !== '' && (
                      <Button className="my-4" variant="tertiary">
                        {cta.label}
                      </Button>
                    )}
                  </div>
                </div>

                {image?.src != null && image.src !== '' && (
                  <BcImage
                    alt={image.alt}
                    blurDataURL={image.blurDataUrl}
                    className="block h-20 w-full object-cover"
                    fill
                    placeholder={
                      image.blurDataUrl != null && image.blurDataUrl !== '' ? 'blur' : 'empty'
                    }
                    priority
                    sizes="100vw"
                    src={image.src}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="text-background absolute bottom-6 left-1/2 flex w-full max-w-screen-2xl -translate-x-1/2 flex-wrap items-center px-3 @xl:px-6 @5xl:px-20">
        {/* Progress Buttons */}
        {scrollSnaps.map((_: number, index: number) => {
          return (
            <button
              aria-label={`View image number ${index + 1}`}
              className="rounded-lg px-1.5 py-2 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
              key={index}
              onClick={() => {
                onProgressButtonClick(index);
                resetAutoplay();
              }}
            >
              <div className="relative overflow-hidden">
                {/* White Bar - Current Index Indicator / Progress Bar */}
                <div
                  className={clsx(
                    'bg-background absolute h-0.5',
                    'opacity-0 fill-mode-forwards',
                    isPlaying ? 'running' : 'paused',
                    index === selectedIndex
                      ? 'opacity-100 ease-linear animate-in slide-in-from-left'
                      : 'ease-out animate-out fade-out',
                  )}
                  key={`progress-${playCount}`} // Force the animation to restart when pressing "Play", to match animation with embla's autoplay timer
                  style={{
                    animationDuration: index === selectedIndex ? `${interval}ms` : '200ms',
                    width: `${175 / slides.length}px`,
                  }}
                />
                {/* Grey Bar BG */}
                <div
                  className="bg-background h-0.5 opacity-30"
                  style={{ width: `${175 / slides.length}px` }}
                />
              </div>
            </button>
          );
        })}

        {/* Carousel Count - "01/03" */}
        <span className="ml-auto mr-2 mt-px font-mono text-xs">
          {selectedIndex + 1 < 10 ? `0${selectedIndex + 1}` : selectedIndex + 1}/
          {slides.length < 10 ? `0${slides.length}` : slides.length}
        </span>

        {/* Stop / Start Button */}
        <button
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="border-contrast-300/50 hover:border-contrast-300/80 flex h-7 w-7 items-center justify-center rounded-lg border ring-primary transition-opacity duration-300 focus-visible:outline-0 focus-visible:ring-2"
          onClick={toggleAutoplay}
          type="button"
        >
          {isPlaying ? (
            <Pause className="pointer-events-none w-3.5" strokeWidth={1.5} />
          ) : (
            <Play className="pointer-events-none ml-0.5 w-3.5" strokeWidth={1.5} />
          )}
        </button>
      </div>
    </section>
  );
};
