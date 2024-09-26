'use client';

import React, { useState } from 'react';

import { Breadcrumb } from '@/vibes/soul/components/breadcrumbs';
import { CompareDrawer } from '@/vibes/soul/components/compare-drawer';
import { type Filters } from '@/vibes/soul/components/filter-panel';
import { Pagination } from '@/vibes/soul/components/pagination';
import { Product } from '@/vibes/soul/components/product-card';
import { ProductsHeader, type Sort } from '@/vibes/soul/components/products-header';
import { ProductsList } from '@/vibes/soul/components/products-list';

interface Props {
  breadcrumbs?: Breadcrumb[];
  title: string;
  products: Product[];
  // pages: number;
  pagination: {
    endCursor?: string;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    startCursor?: string;
  };
  totalProducts: number;
  filters: Filters;
  sort: Sort;
}

export const CompareProducts = function CompareProducts({
  breadcrumbs,
  title,
  products,
  // pages,
  totalProducts,
  pagination,
  filters,
  sort,
}: Props) {
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);

  return (
    <div className="mx-auto max-w-screen-2xl">
      <ProductsHeader
        breadcrumbs={breadcrumbs}
        filters={filters}
        numberOfProducts={totalProducts}
        sort={sort}
        title={title}
      />
      <ProductsList
        compareProducts={compareProducts}
        products={products}
        setCompareProducts={setCompareProducts}
      />
      {/* <Pagination pages={pages} /> */}
      <Pagination {...pagination} />
      <CompareDrawer compareProducts={compareProducts} setCompareProducts={setCompareProducts} />
    </div>
  );
};
