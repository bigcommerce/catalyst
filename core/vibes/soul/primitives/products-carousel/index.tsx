import { clsx } from 'clsx';
import { Suspense } from 'react';

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

import { Streamable } from '../../lib/streamable';
import { mapStreamable } from '../../lib/streamable/server';

export type CarouselProduct = CardProduct;

interface Props {
  products: Streamable<CarouselProduct[]>;
  className?: string;
  emptyStateMessage?: string;
}

export function ProductsCarousel({
  products: streamableProducts,
  className,
  emptyStateMessage = 'No products found',
}: Props) {
  return (
    <Carousel className={className}>
      <CarouselContent className="mb-10">
        <Suspense
          fallback={<ProductsCarouselSkeleton className={className} message={emptyStateMessage} />}
        >
          {mapStreamable(streamableProducts, (products) => {
            if (products.length === 0) {
              return <ProductsCarouselSkeleton className={className} message={emptyStateMessage} />;
            }

            return products.map((product) => (
              <CarouselItem
                className="basis-full @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4"
                key={product.id}
              >
                <ProductCard product={product} />
              </CarouselItem>
            ));
          })}
        </Suspense>
      </CarouselContent>
      <div className="flex w-full items-center justify-between">
        <CarouselScrollbar />
        <CarouselButtons />
      </div>
    </Carousel>
  );
}

export function ProductsCarouselSkeleton({
  className,
  message,
  count = 8,
}: {
  className?: string;
  message?: string;
  count?: number;
}) {
  return (
    <Carousel className={className}>
      <CarouselContent
        className={clsx(
          'relative mb-10',
          message != null &&
            message !== '' &&
            '[mask-image:radial-gradient(circle,transparent,black)]',
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
      <div className="flex w-full items-center justify-between">
        <CarouselScrollbar />
        <CarouselButtons />
      </div>
      <div className="absolute inset-0 flex items-center justify-center text-lg">{message}</div>
    </Carousel>
  );
}
