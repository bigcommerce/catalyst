'use client';

import React, { useState } from 'react';

import { Breadcrumb } from '@/vibes/soul/components/breadcrumbs';
import { CompareDrawer } from '@/vibes/soul/components/compare-drawer';
import { Pagination } from '@/vibes/soul/components/pagination';
import { Product } from '@/vibes/soul/components/product-card';
import { ProductsHeader } from '@/vibes/soul/components/products-header';
import { ProductsList } from '@/vibes/soul/components/products-list';

interface Props {
  breadcrumbs?: Breadcrumb[];
  title: string;
  products: Product[];
  pages: number;
}

export const CompareProducts = function CompareProducts({
  breadcrumbs,
  title,
  products,
  pages,
}: Props) {
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);

  return (
    <div className="mx-auto max-w-screen-2xl">
      <ProductsHeader breadcrumbs={breadcrumbs} numberOfProducts={products.length} title={title} />
      <ProductsList
        compareProducts={compareProducts}
        products={products}
        setCompareProducts={setCompareProducts}
      />
      <Pagination pages={pages} />
      <CompareDrawer compareProducts={compareProducts} setCompareProducts={setCompareProducts} />
    </div>
  );
};
