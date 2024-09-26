'use client';

import { useSearchParams } from 'next/navigation';
import React, { startTransition } from 'react';

import { Breadcrumb, Breadcrumbs } from '@/vibes/soul/components/breadcrumbs';
import { Dropdown } from '@/vibes/soul/components/dropdown';
import { FilterPanel, type Filters } from '@/vibes/soul/components/filter-panel';
import { usePathname, useRouter } from '~/i18n/routing';

export type Sort = Array<{ value: string; label: string; selected?: boolean }>;

interface Props {
  breadcrumbs?: Breadcrumb[];
  title: string;
  numberOfProducts: number;
  filters: Filters;
  sort: Sort;
}

export const ProductsHeader = function ProductsHeader({
  breadcrumbs,
  title,
  numberOfProducts,
  filters,
  sort,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onSort = (sortValue: string) => {
    const params = new URLSearchParams(searchParams);

    params.set('sort', sortValue);
    params.delete('before');
    params.delete('after');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

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
          <FilterPanel filters={filters} />
          <Dropdown
            items={sort.map(({ value, label, selected }) => ({
              textValue: label,
              onSelect: () => onSort(value),
              selected,
            }))}
            label="Sort"
            // eslint-disable-next-line react/style-prop-object
            style="round"
          />
        </div>
      </div>
    </div>
  );
};
