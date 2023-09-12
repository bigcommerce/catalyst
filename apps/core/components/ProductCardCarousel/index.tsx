'use client';

import { Product } from '@bigcommerce/catalyst-client';
import {
  Carousel,
  CarouselContent,
  CarouselNextIndicator,
  CarouselPagination,
  CarouselPaginationTab,
  CarouselPreviousIndicator,
  CarouselSlide,
} from '@bigcommerce/reactant/Carousel';
import { useId } from 'react';
import { PartialDeep } from 'type-fest';

import { ProductCard } from '../ProductCard';

export const ProductCardCarousel = ({
  title,
  groupedProducts,
}: {
  title: string;
  groupedProducts: Array<Array<PartialDeep<Product>>>;
}) => {
  const id = useId();

  if (groupedProducts.length === 0) {
    return null;
  }

  return (
    <Carousel aria-labelledby="title" className="mb-14">
      <div className="flex items-center justify-between">
        <h2 className="text-h3" id="title">
          {title}
        </h2>
        <span className="no-wrap flex">
          <CarouselPreviousIndicator />
          <CarouselNextIndicator />
        </span>
      </div>
      <CarouselContent>
        {groupedProducts.map((group, index) => (
          <CarouselSlide
            aria-label={`${index + 1} of ${groupedProducts.length}`}
            id={`${id}-slide-${index + 1}`}
            index={index}
            key={index}
          >
            {group.map((product) => (
              <ProductCard imageSize="tall" key={product.entityId} product={product} />
            ))}
          </CarouselSlide>
        ))}
      </CarouselContent>
      <CarouselPagination>
        {({ selectedIndex, scrollTo }) =>
          groupedProducts.map((_, index) => (
            <CarouselPaginationTab
              aria-controls={`${id}-slide-${index + 1}`}
              aria-label={`Slide ${index + 1}`}
              isSelected={selectedIndex === index}
              key={index}
              onClick={() => scrollTo(index)}
            />
          ))
        }
      </CarouselPagination>
    </Carousel>
  );
};
