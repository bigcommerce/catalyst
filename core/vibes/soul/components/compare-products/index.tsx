'use client';

import React, { useState } from 'react';

import { Breadcrumb } from '@/vibes/soul/components/breadcrumbs';
import { CompareDrawer } from '@/vibes/soul/components/compare-drawer';
import { type Filters } from '@/vibes/soul/components/filter-panel';
import { Pagination } from '@/vibes/soul/components/pagination';
import { Product, ProductCardSkeleton } from '@/vibes/soul/components/product-card';
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

export const CompareProductsSkeleton = () => (
  <div className="mx-auto max-w-screen-2xl">
    <div className="relative z-10 pb-10 @container">
      <div className="px-3 pb-6 pt-24 @xl:px-6 @4xl:pt-32 @5xl:px-20" />
      {/* Products Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-background text-foreground">
        <div className="h-[50px] animate-pulse cursor-pointer rounded-xl" />
      </div>
    </div>
    <div className="w-full bg-background pt-0.5 @container">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-x-5 gap-y-10 px-3 @md:grid-cols-2 @xl:gap-y-10 @xl:px-6 @4xl:grid-cols-3 @5xl:px-20">
        {Array.from({ length: 5 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  </div>
);
