import { clsx } from 'clsx';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '@/vibes/soul/primitives/carousel';
import {
  CardProduct,
  ProductCard,
  ProductCardSkeleton,
} from '@/vibes/soul/primitives/product-card';

export type CarouselProduct = CardProduct;

interface Props {
  products: Streamable<CarouselProduct[]>;
  className?: string;
  colorScheme?: 'light' | 'dark';
  aspectRatio?: '5:6' | '3:4' | '1:1';
  emptyStateTitle?: Streamable<string | null>;
  emptyStateSubtitle?: Streamable<string | null>;
  scrollbarLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  placeholderCount?: number;
  showButtons?: boolean;
  showScrollbar?: boolean;
}

export function ProductsCarousel({
  products: streamableProducts,
  className,
  colorScheme = 'light',
  aspectRatio = '5:6',
  emptyStateTitle,
  emptyStateSubtitle,
  scrollbarLabel,
  previousLabel,
  nextLabel,
  placeholderCount = 8,
  showButtons = true,
  showScrollbar = true,
}: Props) {
  return (
    <Stream
      fallback={<ProductsCarouselSkeleton pending placeholderCount={placeholderCount} />}
      value={streamableProducts}
    >
      {(products) => {
        if (products.length === 0) {
          return (
            <ProductsCarouselEmptyState
              emptyStateSubtitle={emptyStateSubtitle}
              emptyStateTitle={emptyStateTitle}
              placeholderCount={placeholderCount}
            />
          );
        }

        return (
          <Carousel className={className}>
            <CarouselContent className="mb-10">
              {products.map((product, i) => (
                <CarouselItem
                  className="basis-[calc(100%-1rem)] @md:basis-[calc(50%-0.75rem)] @lg:basis-[calc(33%-0.5rem)] @2xl:basis-[calc(25%-0.25rem)]"
                  key={product.id}
                >
                  <ProductCard
                    aspectRatio={aspectRatio}
                    colorScheme={colorScheme}
                    imagePriority={i === 0}
                    product={product}
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
  pending = false,
}: {
  className?: string;
  placeholderCount?: number;
  pending?: boolean;
}) {
  return (
    <Carousel className={className} data-pending={pending ? '' : undefined}>
      <CarouselContent className="mb-10">
        {Array.from({ length: placeholderCount }).map((_, index) => (
          <CarouselItem
            className="basis-full @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4"
            key={index}
          >
            <ProductCardSkeleton />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="h-6 w-56 animate-pulse bg-contrast-100" />
    </Carousel>
  );
}

export function ProductsCarouselEmptyState({
  className,
  placeholderCount = 8,
  emptyStateTitle,
  emptyStateSubtitle,
}: {
  className?: string;
  placeholderCount?: number;
  emptyStateTitle?: Streamable<string | null>;
  emptyStateSubtitle?: Streamable<string | null>;
}) {
  return (
    <Carousel className={clsx('relative', className)}>
      <CarouselContent
        className={clsx('mb-10 [mask-image:linear-gradient(to_bottom,_black_0%,_transparent_90%)]')}
      >
        {Array.from({ length: placeholderCount }).map((_, index) => (
          <CarouselItem
            className="basis-full @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4"
            key={index}
          >
            <ProductCardSkeleton />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="absolute inset-0 mx-auto px-3 py-16 pb-3 @4xl:px-10 @4xl:pb-10 @4xl:pt-28">
        <div className="mx-auto max-w-xl space-y-2 text-center @4xl:space-y-3">
          <h3 className="@4x:leading-none font-heading text-2xl leading-tight text-foreground @4xl:text-4xl">
            {emptyStateTitle}
          </h3>
          <p className="text-sm text-contrast-500 @4xl:text-lg">{emptyStateSubtitle}</p>
        </div>
      </div>
    </Carousel>
  );
}
