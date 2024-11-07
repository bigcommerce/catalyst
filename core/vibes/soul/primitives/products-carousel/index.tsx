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
};

export function ProductsCarousel({ products, className }: Props) {
  return (
    <Carousel className={className}>
      <CarouselContent className="mb-10">
        {products.length > 0
          ? products.map((product) => (
              <CarouselItem
                key={product.id}
                className="basis-full @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4"
              >
                <ProductCard product={product} />
              </CarouselItem>
            ))
          : Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem
                key={index}
                className="basis-full @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4"
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
