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
  emptyStateTitle?: string;
  emptyStateSubtitle?: string;
}

export function ProductsCarousel({
  products: streamableProducts,
  className,
  emptyStateTitle,
  emptyStateSubtitle,
}: Props) {
  return (
    <Stream fallback={<ProductsCarouselSkeleton pending />} value={streamableProducts}>
      {(products) => {
        if (products.length === 0) {
          return (
            <ProductsCarouselEmptyState
              emptyStateSubtitle={emptyStateSubtitle}
              emptyStateTitle={emptyStateTitle}
            />
          );
        }

        return (
          <Carousel className={className}>
            <CarouselContent className="mb-10">
              {products.map((product) => (
                <CarouselItem
                  className="basis-full @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4"
                  key={product.id}
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex w-full items-center justify-between">
              <CarouselScrollbar />
              <CarouselButtons />
            </div>
          </Carousel>
        );
      }}
    </Stream>
  );
}

export function ProductsCarouselSkeleton({
  className,
  count = 8,
  pending = false,
}: {
  className?: string;
  count?: number;
  pending?: boolean;
}) {
  return (
    <Carousel className={className} data-pending={pending ? '' : undefined}>
      <CarouselContent className="mb-10">
        {Array.from({ length: count }).map((_, index) => (
          <CarouselItem
            className="basis-full @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4"
            key={index}
          >
            <ProductCardSkeleton />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex w-full items-center justify-between">
        <CarouselScrollbar />
        <CarouselButtons />
      </div>
    </Carousel>
  );
}

export function ProductsCarouselEmptyState({
  className,
  count = 8,
  emptyStateTitle,
  emptyStateSubtitle,
}: {
  className?: string;
  count?: number;
  emptyStateTitle?: string;
  emptyStateSubtitle?: string;
}) {
  return (
    <Carousel className={clsx('relative', className)}>
      <CarouselContent
        className={clsx(
          'mb-10 [mask-image:linear-gradient(to_top,_transparent_0%,_hsl(var(--background))_75%)]',
        )}
      >
        {Array.from({ length: count }).map((_, index) => (
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
