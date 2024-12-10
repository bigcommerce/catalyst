'use client';

import clsx from 'clsx';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import * as React from 'react';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = React.ComponentPropsWithoutRef<'div'> & {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
}

function Carousel({ opts, setApi, plugins, className, children, ...rest }: CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(opts, plugins);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return;

    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);

  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  useEffect(() => {
    if (!api || !setApi) return;

    setApi(api);
  }, [api, setApi]);

  useEffect(() => {
    if (!api) return;

    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        {...rest}
        aria-roledescription="carousel"
        className={clsx('relative @container', className)}
        onKeyDownCapture={handleKeyDown}
        role="region"
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const { carouselRef } = useCarousel();

  return (
    <div className="w-full" ref={carouselRef}>
      <div {...rest} className={clsx('-ml-4 flex @2xl:-ml-5', className)} />
    </div>
  );
}

function CarouselItem({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      aria-roledescription="slide"
      className={clsx('min-w-0 shrink-0 grow-0 pl-4 @2xl:pl-5', className)}
      role="group"
    />
  );
}

function CarouselButtons({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel();

  return (
    <div
      {...rest}
      className={clsx(
        'flex gap-2 text-foreground',
        !canScrollPrev && !canScrollNext && 'hidden',
        className,
      )}
    >
      <button
        type="button"
        className="rounded-lg ring-primary transition-colors duration-300 focus-visible:outline-0 focus-visible:ring-2 disabled:pointer-events-none disabled:text-contrast-300"
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        title="Previous"
      >
        <ArrowLeft strokeWidth={1.5} />
      </button>
      <button
        type="button"
        className="rounded-lg ring-primary transition-colors duration-300 focus-visible:outline-0 focus-visible:ring-2 disabled:pointer-events-none disabled:text-contrast-300"
        disabled={!canScrollNext}
        onClick={scrollNext}
        title="Next"
      >
        <ArrowRight strokeWidth={1.5} />
      </button>
    </div>
  );
}

function CarouselScrollbar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const { api, canScrollPrev, canScrollNext } = useCarousel();
  const [progress, setProgress] = useState(0);
  const [scrollbarPosition, setScrollbarPosition] = useState({ width: 0, left: 0 });

  const findClosestSnap = useCallback(
    (progress: number) => {
      if (!api) return 0;

      const point = progress / 100;
      const snapList = api.scrollSnapList();

      if (snapList.length === 0) return -1;

      const closestSnap = snapList.reduce((prev, curr) =>
        Math.abs(curr - point) < Math.abs(prev - point) ? curr : prev,
      );

      return snapList.findIndex((snap) => snap === closestSnap);
    },
    [api],
  );

  useEffect(() => {
    if (!api) return;

    const snapList = api.scrollSnapList();
    const closestSnapIndex = findClosestSnap(progress);
    const scrollbarWidth = 100 / snapList.length;
    const scrollbarLeft = (closestSnapIndex / snapList.length) * 100;

    setScrollbarPosition({ width: scrollbarWidth, left: scrollbarLeft });

    api.scrollTo(closestSnapIndex);
  }, [progress, api, findClosestSnap]);

  useEffect(() => {
    if (!api) return;

    function onScroll() {
      if (!api) return;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setProgress(api.scrollSnapList()[api.selectedScrollSnap()]! * 100);
    }

    api.on('select', onScroll);
    api.on('scroll', onScroll);

    return () => {
      api.off('select', onScroll);
      api.off('scroll', onScroll);
    };
  }, [api]);

  return (
    <div
      className={clsx(
        'relative flex h-6 w-full max-w-56 items-center overflow-hidden',
        !canScrollPrev && !canScrollNext && 'hidden',
        className,
      )}
    >
      <input
        className="absolute h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
        max={100}
        min={0}
        onChange={(e) => setProgress(e.currentTarget.valueAsNumber)}
        type="range"
        value={progress}
        title="Scrollbar"
      />
      {/* Track */}
      <div className="pointer-events-none absolute h-1 w-full rounded-full bg-contrast-100" />

      {/* Bar */}
      <div
        className="pointer-events-none absolute h-1 rounded-full bg-foreground transition-all ease-out"
        style={{
          width: `${scrollbarPosition.width}%`,
          left: `${scrollbarPosition.left}%`,
        }}
      />
    </div>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselButtons,
  CarouselScrollbar,
};
