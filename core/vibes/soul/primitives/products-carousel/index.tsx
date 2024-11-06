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
  products: CarouselProduct[];
  className?: string;
}

export function ProductsCarousel({ products, className }: Props) {
  return (
    <Carousel className={className}>
      <CarouselContent className="mb-20">
        {products.length > 0
          ? products.map((product) => (
              <CarouselItem
                className="basis-full @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4"
                key={product.id}
              >
                <ProductCard product={product} />
              </CarouselItem>
            ))
          : Array.from({ length: 5 }).map((_, index) => (
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
