'use client';

import { CarouselPagination, CarouselPaginationTab } from '@bigcommerce/reactant/Carousel';

import { Product } from '../ProductCard';

export const Pagination = ({
  groupedProducts,
  id,
}: {
  groupedProducts: Array<Array<Partial<Product>>>;
  id: string;
}) => {
  return (
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
  );
};
