import clsx from 'clsx';
import { Suspense } from 'react';

import { ProductCard, ProductCardProps, ProductCardSkeleton } from '../product-card';
import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '../carousel';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { mapStreamable } from '@/vibes/soul/lib/streamable/server';

export type ProductCard = ProductCardProps & {
  id: string;
};

type Props = {
  productCards: Streamable<ProductCard[]>;
  classNames?: {
    root?: string,
    content?: string,
    item?: string
  };
  emptyStateMessage?: string;
};

export function ProductCardCarousel({
  productCards: streamableProductCards,
  classNames,
  emptyStateMessage = 'No products found',
}: Props) {
  return (
    <Carousel className={clsx('overflow-x-hidden w-full max-w-full relative', classNames?.root)}>
      <CarouselContent className={clsx('mb-10', classNames?.content)}>
        <Suspense
          fallback={<ProductCardCarouselSkeleton classNames={classNames} message={emptyStateMessage} />}
        >
          {mapStreamable(streamableProductCards, (productCards) => {
            if (productCards.length === 0) {
              return <ProductCardCarouselSkeleton classNames={classNames} message={emptyStateMessage} />;
            }

            return productCards.map((productCard) => (
              <CarouselItem
                //className={clsx('basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6', classNames?.item)}
                className={clsx('basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6', classNames?.item)}
                key={productCard.id}
              >
                <ProductCard {...productCard} />
              </CarouselItem>
            ));
          })}
        </Suspense>
      </CarouselContent>
      <CarouselScrollbar />
      <CarouselButtons />
    </Carousel>
  );
}

export function ProductCardCarouselSkeleton({
  classNames,
  message,
  count = 8,
}: {
  classNames?: {
    root?: string,
    content?: string,
    item?: string
  };
  message?: string;
  count?: number;
}) {
  return (
    <Carousel className={clsx('overflow-x-hidden w-full max-w-full relative', classNames?.root)}>
      <CarouselContent
        className={clsx(
          'relative mb-10',
          classNames?.content,
          message && message !== '' && '[mask-image:radial-gradient(circle,transparent,black)]',
        )}
      >
        {Array.from({ length: count }).map((_, index) => (
          <CarouselItem
            className={clsx('basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6', classNames?.item)}
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
