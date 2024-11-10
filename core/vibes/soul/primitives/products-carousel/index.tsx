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

type Props = {
  products: CarouselProduct[];
  className?: string;
  emptyStateMessage?: string;
};

export function ProductsCarousel({ products, className, emptyStateMessage }: Props) {
  if (products.length === 0) {
    return <ProductsCarouselEmptyState className={className} message={emptyStateMessage} />;
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
}

export function ProductsCarouselEmptyState({
  className,
  message = 'No products found',
}: {
  className?: string;
  message?: string;
}) {
  return (
    <Carousel className={className}>
      <CarouselContent className="relative mb-10 [mask-image:radial-gradient(circle,transparent,black)]">
        {Array.from({ length: 8 }).map((_, index) => (
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

export function ProductsCarouselSkeleton({ className }: Props) {
  return (
    <Carousel className={className}>
      <CarouselContent className="mb-10">
        {Array.from({ length: 8 }).map((_, index) => (
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
