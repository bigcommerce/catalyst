import { clsx } from 'clsx';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '@/vibes/soul/primitives/carousel';
import {
  type Product,
  ProductCard,
  ProductCardSkeleton,
} from '@/vibes/soul/primitives/product-card';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';

export type CarouselProduct = Product;

export interface ProductCarouselProps {
  products: Streamable<CarouselProduct[]>;
  className?: string;
  colorScheme?: 'light' | 'dark';
  aspectRatio?: '5:6' | '3:4' | '1:1';
  emptyStateTitle?: Streamable<string>;
  emptyStateSubtitle?: Streamable<string>;
  scrollbarLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  placeholderCount?: number;
  showButtons?: boolean;
  showScrollbar?: boolean;
  hideOverflow?: boolean;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --product-carousel-light-empty-title: hsl(var(--foreground));
 *   --product-carousel-light-empty-subtitle: hsl(var(--contrast-500));
 *   --product-carousel-dark-empty-title: hsl(var(--background));
 *   --product-carousel-dark-empty-subtitle: hsl(var(--contrast-100));
 *   --product-carousel-empty-title-font-family: var(--font-family-heading);
 *   --product-carousel-empty-subtitle-font-family: var(--font-family-body);
 * }
 * ```
 */
export function ProductCarousel({
  products: streamableProducts,
  className,
  colorScheme = 'light',
  aspectRatio = '5:6',
  emptyStateTitle = 'No products found',
  emptyStateSubtitle = 'Try browsing our complete catalog of products.',
  scrollbarLabel = 'Scroll',
  previousLabel = 'Previous',
  nextLabel = 'Next',
  placeholderCount = 8,
  showButtons = true,
  showScrollbar = true,
  hideOverflow = true,
}: ProductCarouselProps) {
  return (
    <Stream
      fallback={
        <ProductsCarouselSkeleton
          className={className}
          hideOverflow={hideOverflow}
          placeholderCount={placeholderCount}
        />
      }
      value={streamableProducts}
    >
      {(products) => {
        if (products.length === 0) {
          return (
            <ProductsCarouselEmptyState
              className={className}
              colorScheme={colorScheme}
              emptyStateSubtitle={emptyStateSubtitle}
              emptyStateTitle={emptyStateTitle}
              hideOverflow={hideOverflow}
              placeholderCount={placeholderCount}
            />
          );
        }

        return (
          <Carousel className={className} hideOverflow={hideOverflow}>
            <CarouselContent className="-ml-4 mb-10 @2xl:-ml-5">
              {products.map(({ id, ...product }) => (
                <CarouselItem
                  className="basis-full pl-4 @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4 @2xl:pl-5"
                  key={id}
                >
                  <ProductCard
                    aspectRatio={aspectRatio}
                    colorScheme={colorScheme}
                    imageSizes="(min-width: 42rem) 25vw, (min-width: 32rem) 33vw, (min-width: 28rem) 50vw, 100vw"
                    product={{ id, ...product }}
                    showButton={true}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {(showButtons || showScrollbar) && (
              <div className="mt-10 flex w-full items-center justify-between gap-8">
                <CarouselScrollbar
                  className={clsx(!showScrollbar && 'pointer-events-none invisible')}
                  colorScheme={colorScheme}
                  label={scrollbarLabel}
                />
                <CarouselButtons
                  className={clsx(!showButtons && 'pointer-events-none invisible')}
                  colorScheme={colorScheme}
                  nextLabel={nextLabel}
                  previousLabel={previousLabel}
                />
              </div>
            )}
          </Carousel>
        );
      }}
    </Stream>
  );
}

export function ProductsCarouselSkeleton({
  className,
  placeholderCount = 8,
  hideOverflow,
}: Pick<ProductCarouselProps, 'className' | 'placeholderCount' | 'hideOverflow'>) {
  return (
    <Skeleton.Root
      className={clsx('group-has-[[data-pending]]/product-carousel:animate-pulse', className)}
      hideOverflow={hideOverflow}
      pending
    >
      <div className="w-full">
        <div className="-ml-4 flex @2xl:-ml-5">
          {Array.from({ length: placeholderCount }).map((_, index) => (
            <div
              className="min-w-0 shrink-0 grow-0 basis-full pl-4 @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4 @2xl:pl-5"
              key={index}
            >
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-10 flex w-full items-center justify-between gap-8">
        <Skeleton.Box className="h-1 w-56 rounded" />
        <div className="flex gap-2">
          <Skeleton.Icon icon={<ArrowLeft aria-hidden className="h-6 w-6" strokeWidth={1.5} />} />
          <Skeleton.Icon icon={<ArrowRight aria-hidden className="h-6 w-6" strokeWidth={1.5} />} />
        </div>
      </div>
    </Skeleton.Root>
  );
}

export function ProductsCarouselEmptyState({
  className,
  placeholderCount = 8,
  emptyStateTitle,
  emptyStateSubtitle,
  hideOverflow,
  colorScheme = 'light',
}: Pick<
  ProductCarouselProps,
  | 'className'
  | 'placeholderCount'
  | 'emptyStateTitle'
  | 'emptyStateSubtitle'
  | 'hideOverflow'
  | 'colorScheme'
>) {
  return (
    <Skeleton.Root className={clsx('relative', className)} hideOverflow={hideOverflow}>
      <div className="w-full">
        <div className="-ml-4 flex [mask-image:linear-gradient(to_bottom,_black_0%,_transparent_90%)] @2xl:-ml-5">
          {Array.from({ length: placeholderCount }).map((_, index) => (
            <div
              className="min-w-0 shrink-0 grow-0 basis-full pl-4 @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4 @2xl:pl-5"
              key={index}
            >
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 mx-auto px-3 py-16 pb-3 @4xl:px-10 @4xl:pb-10 @4xl:pt-28">
        <div className="mx-auto max-w-xl space-y-2 text-center @4xl:space-y-3">
          <h3
            className={clsx(
              'font-[family-name:var(--product-carousel-empty-title-font-family,var(--font-family-heading))] text-2xl leading-tight @4xl:text-4xl @4xl:leading-none',
              {
                light: 'text-[var(--product-carousel-light-empty-title,hsl(var(--foreground)))]',
                dark: 'text-[var(--product-carousel-dark-empty-title,hsl(var(--background)))]',
              }[colorScheme],
            )}
          >
            {emptyStateTitle}
          </h3>
          <p
            className={clsx(
              'font-[family-name:var(--product-carousel-empty-subtitle-font-family,var(--font-family-body))] text-sm @4xl:text-lg',
              {
                light:
                  'text-[var(--product-carousel-light-empty-subtitle,hsl(var(--contrast-500)))]',
                dark: 'text-[var(--product-carousel-dark-empty-subtitle,hsl(var(--contrast-200)))]',
              }[colorScheme],
            )}
          >
            {emptyStateSubtitle}
          </p>
        </div>
      </div>
    </Skeleton.Root>
  );
}
