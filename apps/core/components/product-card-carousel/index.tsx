import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNextIndicator,
  CarouselPreviousIndicator,
} from '@bigcommerce/components/carousel';
import { useId } from 'react';

import { Product, ProductCard } from '../product-card';

import { Pagination } from './pagination';

export const ProductCardCarousel = ({
  title,
  products,
  showCart = true,
  showCompare = true,
  showReviews = true,
}: {
  title: string;
  products: Array<Partial<Product>>;
  showCart?: boolean;
  showCompare?: boolean;
  showReviews?: boolean;
}) => {
  const id = useId();

  if (products.length === 0) {
    return null;
  }

  const groupedProducts = products.reduce<Array<Array<Partial<Product>>>>((batches, _, index) => {
    if (index % 4 === 0) {
      batches.push([]);
    }

    const product = products[index];

    if (batches[batches.length - 1] && product) {
      batches[batches.length - 1]?.push(product);
    }

    return batches;
  }, []);

  return (
    <Carousel aria-labelledby="title" className="mb-14" opts={{ loop: true }}>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black lg:text-4xl" id="title">
          {title}
        </h2>
        <span className="no-wrap flex">
          <CarouselPreviousIndicator />
          <CarouselNextIndicator />
        </span>
      </div>
      <CarouselContent>
        {groupedProducts.map((group, index) => (
          <CarouselItem
            aria-label={`${index + 1} of ${groupedProducts.length}`}
            id={`${id}-slide-${index + 1}`}
            index={index}
            key={index}
          >
            {group.map((product) => (
              <ProductCard
                imageSize="tall"
                key={product.entityId}
                product={product}
                showCart={showCart}
                showCompare={showCompare}
                showReviews={showReviews}
              />
            ))}
          </CarouselItem>
        ))}
      </CarouselContent>
      <Pagination groupedProducts={groupedProducts} id={id} />
    </Carousel>
  );
};
