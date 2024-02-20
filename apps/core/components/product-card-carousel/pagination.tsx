'use client';

import { CarouselPagination, CarouselPaginationTab } from '@bigcommerce/components/carousel';

import { Product } from '../product-card';

export const Pagination = ({
  groupedProducts,
  id,
}: {
  groupedProducts: Array<Array<Partial<Product>>>;
  id: string;
}) => {
  return (
    <CarouselPagination>
      {groupedProducts.map((_, index) => (
        <CarouselPaginationTab
          aria-controls={`${id}-slide-${index + 1}`}
          aria-label={`Go to slide ${index + 1}`}
          index={index}
          key={index}
        />
      ))}
    </CarouselPagination>
  );
};
