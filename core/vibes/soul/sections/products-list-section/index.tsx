import { Suspense } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { Breadcrumb, Breadcrumbs } from '@/vibes/soul/primitives/breadcrumbs';
import { CursorPagination, CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { ListProduct, ProductsList } from '@/vibes/soul/primitives/products-list';

import { mapStreamable } from '../../lib/streamable/server';

import { ProductListTransitionProvider } from './context';
import { Filter, FiltersPanel } from './filters-panel';
import { MobileFilters } from './mobile-filters';
import { ProductListContainer } from './product-list-container';
import { Sorting, Option as SortOption } from './sorting';

type Props = {
  breadcrumbs?: Breadcrumb[];
  title?: Streamable<string | null>;
  totalCount: Streamable<number>;
  products: Streamable<ListProduct[]>;
  filters: Streamable<Filter[]>;
  sortOptions: Streamable<SortOption[]>;
  compareProducts?: Streamable<ListProduct[] | null>;
  paginationInfo?: Streamable<CursorPaginationInfo | null>;
  compareAction?: React.ComponentProps<'form'>['action'];
  compareLabel?: string;
  filterLabel?: string;
  resetFiltersLabel?: string;
  sortLabel?: string;
  sortParamName?: string;
  compareParamName?: string;
};

export function ProductsListSection({
  breadcrumbs,
  title = 'Products',
  totalCount,
  products,
  compareProducts,
  sortOptions,
  filters,
  compareAction,
  compareLabel,
  paginationInfo,
  filterLabel,
  resetFiltersLabel,
  sortLabel,
  sortParamName,
  compareParamName,
}: Props) {
  return (
    <ProductListTransitionProvider>
      <div className="@container">
        <div className="mx-auto max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-12">
          <div>
            {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
            <Suspense fallback="Loading...">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-8 pt-6 text-foreground">
                <h1 className="flex items-center gap-2 text-3xl font-medium leading-none @lg:text-4xl @2xl:text-5xl">
                  <Suspense
                    fallback={
                      <span className="inline-flex h-[1lh] w-[6ch] animate-pulse rounded-lg bg-contrast-100" />
                    }
                  >
                    {title}
                  </Suspense>
                  <Suspense
                    fallback={
                      <span className="inline-flex h-[1lh] w-[2ch] animate-pulse rounded-lg bg-contrast-100" />
                    }
                  >
                    <span className="text-contrast-300">{totalCount}</span>
                  </Suspense>
                </h1>
                <div className="flex gap-2">
                  <Sorting label={sortLabel} options={sortOptions} paramName={sortParamName} />
                  <div className="block @3xl:hidden">
                    <MobileFilters filters={filters} label={filterLabel} />
                  </div>
                </div>
              </div>
            </Suspense>
          </div>
          <div className="flex items-stretch gap-8 @4xl:gap-10">
            <div className="hidden w-52 @3xl:block @4xl:w-60">
              <FiltersPanel
                className="sticky top-4"
                filters={filters}
                resetFiltersLabel={resetFiltersLabel}
              />
            </div>

            <ProductListContainer className="flex-1">
              <ProductsList
                compareAction={compareAction}
                compareLabel={compareLabel}
                compareParamName={compareParamName}
                compareProducts={compareProducts}
                products={products}
                showCompare
              />
              {mapStreamable(paginationInfo, (info) => info && <CursorPagination info={info} />)}
            </ProductListContainer>
          </div>
        </div>
      </div>
    </ProductListTransitionProvider>
  );
}
