'use client';

import { clsx } from 'clsx';
import { EmblaCarouselType, EngineType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

import { Image } from '~/components/image';

export type ProductGalleryLoadMoreAction = (
  productId: number,
  cursor: string,
  limit?: number,
) => Promise<{
  images: Array<{ src: string; alt: string }>;
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}>;

export interface ProductGalleryProps {
  images: Array<{ alt: string; src: string }>;
  className?: string;
  thumbnailLabel?: string;
  aspectRatio?:
    | '1:1'
    | '4:5'
    | '5:4'
    | '3:4'
    | '4:3'
    | '2:3'
    | '3:2'
    | '16:9'
    | '9:16'
    | '5:6'
    | '6:5';
  fit?: 'contain' | 'cover';
  pageInfo?: { hasNextPage: boolean; endCursor: string | null };
  productId?: number;
  loadMoreAction?: ProductGalleryLoadMoreAction;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --product-gallery-focus: hsl(var(--primary));
 *   --product-gallery-image-background: hsl(var(--contrast-100));
 *   --product-gallery-image-border: hsl(var(--contrast-100));
 *   --product-gallery-image-border-active: hsl(var(--foreground));
 *   --product-gallery-load-more: hsl(var(--foreground));
 * }
 * ```
 */
export function ProductGallery({
  images: initialImages,
  className,
  // thumbnailLabel = 'View image number',
  aspectRatio = '4:5',
  fit = 'contain',
  pageInfo: initialPageInfo,
  productId,
  loadMoreAction,
}: ProductGalleryProps) {
  const [images, setImages] = useState(initialImages);
  const [pageInfo, setPageInfo] = useState(initialPageInfo);
  const [hasMoreToLoad, setHasMoreToLoad] = useState(initialPageInfo?.hasNextPage ?? false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isPending, startTransition] = useTransition();

  const scrollListenerRef = useRef<() => void>(() => undefined);
  const listenForScrollRef = useRef(true);
  const hasMoreToLoadRef = useRef(hasMoreToLoad);

  const [emblaRef, emblaApi] = useEmblaCarousel();

  // Sync props to state
  useEffect(() => {
    setImages(initialImages);
    setPageInfo(initialPageInfo);
    setHasMoreToLoad(initialPageInfo?.hasNextPage ?? false);
  }, [initialImages, initialPageInfo]);

  // Keep ref in sync with state
  useEffect(() => {
    hasMoreToLoadRef.current = hasMoreToLoad;
  }, [hasMoreToLoad]);

  const onSlideChanges = useCallback((carouselApi: EmblaCarouselType) => {
    const reloadEmbla = (): void => {
      const oldEngine = carouselApi.internalEngine();

      carouselApi.reInit();

      const newEngine = carouselApi.internalEngine();
      const copyEngineModules: Array<keyof EngineType> = [
        'scrollBody',
        'location',
        'offsetLocation',
        'previousLocation',
        'target',
      ];

      copyEngineModules.forEach((engineModule) => {
        Object.assign(newEngine[engineModule], oldEngine[engineModule]);
      });

      newEngine.translate.to(oldEngine.location.get());

      const { index } = newEngine.scrollTarget.byDistance(0, false);

      newEngine.indexCurrent.set(index);
      newEngine.animation.start();

      setLoadingMore(false);
      listenForScrollRef.current = true;
    };

    const reloadAfterPointerUp = (): void => {
      // @ts-expect-error - Embla types expect callback params but work without them
      carouselApi.off('pointerUp', reloadAfterPointerUp);
      reloadEmbla();
    };

    const engine = carouselApi.internalEngine();

    if (hasMoreToLoadRef.current && engine.dragHandler.pointerDown()) {
      const boundsActive = engine.limit.pastMaxBound(engine.target.get());

      engine.scrollBounds.toggleActive(boundsActive);
      // @ts-expect-error - Embla types expect callback params but work without them
      carouselApi.on('pointerUp', reloadAfterPointerUp);
    } else {
      reloadEmbla();
    }
  }, []);

  const loadMore = useCallback(
    (carouselApi: EmblaCarouselType) => {
      if (!loadMoreAction || !productId || !pageInfo?.endCursor) return;

      listenForScrollRef.current = false;
      setLoadingMore(true);

      startTransition(async () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const result = await loadMoreAction(productId, pageInfo.endCursor!);

        if (!result.pageInfo.hasNextPage) {
          setHasMoreToLoad(false);
          carouselApi.off('scroll', scrollListenerRef.current);
        }

        setImages((prev) => [...prev, ...result.images]);
        setPageInfo(result.pageInfo);
      });
    },
    [loadMoreAction, productId, pageInfo?.endCursor],
  );

  const onScroll = useCallback(
    (carouselApi: EmblaCarouselType) => {
      if (!listenForScrollRef.current) return;

      const lastSlide = carouselApi.slideNodes().length - 1;
      const lastSlideInView = carouselApi.slidesInView().includes(lastSlide);

      if (lastSlideInView) {
        loadMore(carouselApi);
      }
    },
    [loadMore],
  );

  const addScrollListener = useCallback(
    (carouselApi: EmblaCarouselType) => {
      scrollListenerRef.current = () => onScroll(carouselApi);
      carouselApi.on('scroll', scrollListenerRef.current);
    },
    [onScroll],
  );

  useEffect(() => {
    if (!emblaApi) return;

    addScrollListener(emblaApi);
    emblaApi.on('slideschanged', onSlideChanges);

    return () => {
      emblaApi.off('scroll', scrollListenerRef.current);
      emblaApi.off('slideschanged', onSlideChanges);
    };
  }, [emblaApi, addScrollListener, onSlideChanges]);

  const canLoadMore = Boolean(hasMoreToLoad && loadMoreAction && productId);

  return (
    <div className={clsx('sticky top-4 flex flex-col gap-2', className)}>
      <div className="w-full overflow-hidden rounded-xl @xl:rounded-2xl" ref={emblaRef}>
        <div className="flex">
          {images.map((image, idx) => (
            <div
              className={clsx(
                'relative w-full shrink-0 grow-0 basis-full',
                {
                  '5:6': 'aspect-[5/6]',
                  '3:4': 'aspect-[3/4]',
                  '4:5': 'aspect-[4/5]',
                  '3:2': 'aspect-[3/2]',
                  '2:3': 'aspect-[2/3]',
                  '16:9': 'aspect-[16/9]',
                  '9:16': 'aspect-[9/16]',
                  '6:5': 'aspect-[6/5]',
                  '5:4': 'aspect-[5/4]',
                  '4:3': 'aspect-[4/3]',
                  '1:1': 'aspect-square',
                }[aspectRatio],
              )}
              key={idx}
            >
              <Image
                alt={image.alt}
                className={clsx(
                  'bg-[var(--product-gallery-image-background,hsl(var(--contrast-100)))]',
                  {
                    contain: 'object-contain',
                    cover: 'object-cover',
                  }[fit],
                )}
                fill
                priority={idx === 0}
                sizes="(min-width: 42rem) 50vw, 100vw"
                src={image.src}
              />
            </div>
          ))}
          {canLoadMore && (
            <div
              className={clsx(
                'relative flex w-full shrink-0 grow-0 basis-full items-center justify-center',
                'bg-[var(--product-gallery-image-background,hsl(var(--contrast-100)))]',
                {
                  '5:6': 'aspect-[5/6]',
                  '3:4': 'aspect-[3/4]',
                  '4:5': 'aspect-[4/5]',
                  '3:2': 'aspect-[3/2]',
                  '2:3': 'aspect-[2/3]',
                  '16:9': 'aspect-[16/9]',
                  '9:16': 'aspect-[9/16]',
                  '6:5': 'aspect-[6/5]',
                  '5:4': 'aspect-[5/4]',
                  '4:3': 'aspect-[4/3]',
                  '1:1': 'aspect-square',
                }[aspectRatio],
              )}
            >
              {(loadingMore || isPending) && (
                <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent text-[var(--product-gallery-load-more,hsl(var(--foreground)))]" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnails commented out for now */}
      {/* <div className="flex max-w-full shrink-0 flex-col gap-2">
        <div className="overflow-hidden" ref={emblaThumbsRef}>
          <div className="flex flex-row gap-2 p-1">
            {images.map((image, index) => (
              <button
                aria-label={`${thumbnailLabel} ${index + 1}`}
                className={clsx(
                  'relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--product-gallery-focus,hsl(var(--primary)))] focus-visible:ring-offset-2 @md:h-16 @md:w-16',
                  index === selectedIndex
                    ? 'border-[var(--product-gallery-image-border-active,hsl(var(--foreground)))]'
                    : 'border-transparent',
                )}
                key={index}
                onClick={() => onThumbClick(index)}
                type="button"
              >
                <div
                  className={clsx(
                    index === selectedIndex ? 'opacity-100' : 'opacity-50',
                    'transition-all duration-300 hover:opacity-100',
                  )}
                >
                  <Image
                    alt={image.alt}
                    className="bg-[var(--product-gallery-image-background,hsl(var(--contrast-100)))] object-cover"
                    fill
                    sizes="(min-width: 28rem) 4rem, 3rem"
                    src={image.src}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div> */}
    </div>
  );
}
