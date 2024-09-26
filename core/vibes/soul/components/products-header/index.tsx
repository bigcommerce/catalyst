'use client';

import React from 'react';

import { Breadcrumb, Breadcrumbs } from '@/vibes/soul/components/breadcrumbs';
import { Dropdown } from '@/vibes/soul/components/dropdown';
import { FilterPanel } from '@/vibes/soul/components/filter-panel';

interface Props {
  breadcrumbs?: Breadcrumb[];
  title: string;
  numberOfProducts: number;
}

export const ProductsHeader = function ProductsHeader({
  breadcrumbs,
  title,
  numberOfProducts,
}: Props) {
  return (
    <div className="relative z-10 pb-10 @container">
      {breadcrumbs && (
        <Breadcrumbs
          breadcrumbs={breadcrumbs}
          className="px-3 pb-6 pt-24 @xl:px-6 @4xl:pt-32 @5xl:px-20"
        />
      )}
      {/* Products Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-background text-foreground">
        <h1 className="pl-3 font-heading text-xl font-medium leading-none @xl:pl-6 @2xl:text-5xl @5xl:pl-20">
          {title} <span className="text-contrast-200">{numberOfProducts}</span>
        </h1>
        <div className="ml-auto flex gap-2 pr-3 @xl:pr-6 @5xl:pr-20">
          {/* Filter Button & Panel */}
          <FilterPanel />
          <Dropdown
            items={['Most Recent', 'Most Popular', 'Price: Low to High', 'Price: High to Low']}
            label="Sort"
            // eslint-disable-next-line react/style-prop-object
            style="round"
          />
        </div>
      </div>
    </div>
  );
};
