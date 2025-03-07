import { Sliders } from 'lucide-react';
import { Suspense } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Button } from '@/vibes/soul/primitives/button';
import { CursorPagination, CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import * as SidePanel from '@/vibes/soul/primitives/side-panel';
import {
  Breadcrumbs,
  BreadcrumbsSkeleton,
  BreadcrumbWithId,
} from '@/vibes/soul/sections/breadcrumbs';
import { ListProduct, ProductList } from '@/vibes/soul/sections/product-list';
import { Filter, FiltersPanel } from '@/vibes/soul/sections/products-list-section/filters-panel';
import {
  Sorting,
  SortingSkeleton,
  Option as SortOption,
} from '@/vibes/soul/sections/products-list-section/sorting';

interface Props {
  breadcrumbs?: Streamable<BreadcrumbWithId[]>;
  title?: Streamable<string | null>;
  totalCount: Streamable<number>;
  products: Streamable<ListProduct[]>;
  filters: Streamable<Filter[]>;
  sortOptions: Streamable<SortOption[]>;
  compareProducts?: Streamable<ListProduct[]>;
  paginationInfo?: Streamable<CursorPaginationInfo>;
  compareAction?: React.ComponentProps<'form'>['action'];
  compareLabel?: Streamable<string>;
  filterLabel?: string;
  filtersPanelTitle?: Streamable<string>;
  resetFiltersLabel?: Streamable<string>;
  rangeFilterApplyLabel?: Streamable<string>;
  sortLabel?: Streamable<string | null>;
  sortPlaceholder?: Streamable<string | null>;
  sortParamName?: string;
  sortDefaultValue?: string;
  compareParamName?: string;
  emptyStateSubtitle?: Streamable<string>;
  emptyStateTitle?: Streamable<string>;
  placeholderCount?: number;
}

export function ProductsListSection({
  breadcrumbs: streamableBreadcrumbs,
  title = 'Products',
  totalCount,
  products,
  compareProducts,
  sortOptions: streamableSortOptions,
  sortDefaultValue,
  filters,
  compareAction,
  compareLabel,
  paginationInfo,
  filterLabel = 'Filters',
  filtersPanelTitle: streamableFiltersPanelTitle = 'Filters',
  resetFiltersLabel,
  rangeFilterApplyLabel,
  sortLabel: streamableSortLabel,
  sortPlaceholder: streamableSortPlaceholder,
  sortParamName,
  compareParamName,
  emptyStateSubtitle,
  emptyStateTitle,
  placeholderCount = 8,
}: Props) {
  return (
    <div className="group/products-list-section @container">
      <div className="mx-auto max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-12">
        <div>
          <Stream fallback={<BreadcrumbsSkeleton />} value={streamableBreadcrumbs}>
            {(breadcrumbs) =>
              breadcrumbs && breadcrumbs.length > 1 && <Breadcrumbs breadcrumbs={breadcrumbs} />
            }
          </Stream>
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 pt-6 text-foreground">
            <h1 className="flex items-center gap-2 font-heading text-3xl font-medium leading-none @lg:text-4xl @2xl:text-5xl">
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
              <Stream
                fallback={<SortingSkeleton />}
                value={Streamable.all([
                  streamableSortLabel,
                  streamableSortOptions,
                  streamableSortPlaceholder,
                ])}
              >
                {([label, options, placeholder]) => (
                  <Sorting
                    defaultValue={sortDefaultValue}
                    label={label}
                    options={options}
                    paramName={sortParamName}
                    placeholder={placeholder}
                  />
                )}
              </Stream>
              <div className="block @3xl:hidden">
                <SidePanel.Root>
                  <SidePanel.Trigger asChild>
                    <Button size="medium" variant="secondary">
                      {filterLabel}
                      <span className="hidden @xl:block">
                        <Sliders size={20} />
                      </span>
                    </Button>
                  </SidePanel.Trigger>
                  <Stream value={streamableFiltersPanelTitle}>
                    {(filtersPanelTitle) => (
                      <SidePanel.Content title={filtersPanelTitle}>
                        <FiltersPanel
                          filters={filters}
                          paginationInfo={paginationInfo}
                          rangeFilterApplyLabel={rangeFilterApplyLabel}
                          resetFiltersLabel={resetFiltersLabel}
                        />
                      </SidePanel.Content>
                    )}
                  </Stream>
                </SidePanel.Root>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-stretch gap-8 @4xl:gap-10">
          <aside className="hidden w-52 @3xl:block @4xl:w-60">
            <Stream value={streamableFiltersPanelTitle}>
              {(filtersPanelTitle) => <h2 className="sr-only">{filtersPanelTitle}</h2>}
            </Stream>
            <FiltersPanel
              className="sticky top-4"
              filters={filters}
              paginationInfo={paginationInfo}
              rangeFilterApplyLabel={rangeFilterApplyLabel}
              resetFiltersLabel={resetFiltersLabel}
            />
          </aside>

          <div className="flex-1 group-has-[[data-pending]]/products-list-section:animate-pulse">
            <ProductList
              compareAction={compareAction}
              compareLabel={compareLabel}
              compareParamName={compareParamName}
              compareProducts={compareProducts}
              emptyStateSubtitle={emptyStateSubtitle}
              emptyStateTitle={emptyStateTitle}
              placeholderCount={placeholderCount}
              products={products}
              showCompare
            />

            {paginationInfo && <CursorPagination info={paginationInfo} />}
          </div>
        </div>
      </div>
    </div>
  );
}
