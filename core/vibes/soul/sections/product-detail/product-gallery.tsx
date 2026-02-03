'use client';

import { clsx } from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import { Ellipsis } from 'lucide-react';
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
  loadMoreLabel?: string;
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
  thumbnailLabel = 'View image number',
  aspectRatio = '4:5',
  fit = 'contain',
  pageInfo: initialPageInfo,
  productId,
  loadMoreAction,
  loadMoreLabel = 'Load more images',
}: ProductGalleryProps) {
  const [images, setImages] = useState(initialImages);
  const [pageInfo, setPageInfo] = useState(initialPageInfo);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel();

  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  });
  const [isPending, startTransition] = useTransition();
  const pendingScrollIndexRef = useRef<number | null>(null);

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaApi || !emblaThumbsApi) return;
      emblaApi.goTo(index);
    },
    [emblaApi, emblaThumbsApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaApi.selectedSnap());
    emblaThumbsApi.goTo(emblaApi.selectedSnap());
  }, [emblaApi, emblaThumbsApi]);

  useEffect(() => {
    setImages(initialImages);
    setPageInfo(initialPageInfo);
  }, [initialImages, initialPageInfo]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reinit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reinit', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
    if (emblaThumbsApi) emblaThumbsApi.reInit();

    // Navigate to the first newly loaded image after load more
    if (pendingScrollIndexRef.current !== null && emblaApi) {
      emblaApi.goTo(pendingScrollIndexRef.current);
      pendingScrollIndexRef.current = null;
    }
  }, [emblaApi, emblaThumbsApi, images]);

  const loadMore = () => {
    if (!loadMoreAction || !productId || !pageInfo?.endCursor) return;

    startTransition(async () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const result = await loadMoreAction(productId, pageInfo.endCursor!);

      // Store the index of the first new image to scroll to after reInit
      pendingScrollIndexRef.current = images.length;

      setImages((prev) => [...prev, ...result.images]);
      setPageInfo(result.pageInfo);
    });
  };

  const canLoadMore = Boolean(pageInfo?.hasNextPage && loadMoreAction && productId);

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
        </div>
      </div>
      <div className="flex max-w-full shrink-0 flex-col gap-2">
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
            {canLoadMore && (
              <button
                aria-label={loadMoreLabel}
                className={clsx(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-transparent bg-[var(--product-gallery-image-background,hsl(var(--contrast-100)))] text-[var(--product-gallery-load-more,hsl(var(--foreground)))] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--product-gallery-focus,hsl(var(--primary)))] focus-visible:ring-offset-2 @md:h-16 @md:w-16',
                  'opacity-50 hover:opacity-100 disabled:pointer-events-none',
                )}
                disabled={isPending}
                onClick={loadMore}
                type="button"
              >
                {isPending ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Ellipsis className="h-5 w-5" strokeWidth={2} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
