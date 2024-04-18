'use client';

import { CarouselPagination, CarouselPaginationTab } from '@bigcommerce/components/carousel';

interface Props {
  id: string;
  groupedProducts: unknown[];
}

export const Pagination = ({ groupedProducts, id }: Props) => {
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
