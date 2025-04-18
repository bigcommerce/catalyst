import { Sliders } from 'lucide-react';
import { Suspense } from 'react';

import { Stream, Streamable } from '@/ui/lib/streamable';
import { Button } from '@/ui/primitives/button';
import { CursorPagination, CursorPaginationInfo } from '@/ui/primitives/cursor-pagination';
import { Product } from '@/ui/primitives/product-card';
import * as SidePanel from '@/ui/primitives/side-panel';
import { Breadcrumb, Breadcrumbs, BreadcrumbsSkeleton } from '@/ui/sections/breadcrumbs';
import { ProductList } from '@/ui/sections/product-list';
import { Filter, FiltersPanel } from '@/ui/sections/products-list-section/filters-panel';
import {
  Sorting,
  SortingSkeleton,
  Option as SortOption,
} from '@/ui/sections/products-list-section/sorting';

interface Props {
  breadcrumbs?: Streamable<Breadcrumb[]>;
  title?: Streamable<string | null>;
  totalCount: Streamable<number>;
  products: Streamable<Product[]>;
  filters: Streamable<Filter[]>;
  sortOptions: Streamable<SortOption[]>;
  compareProducts?: Streamable<Product[]>;
  paginationInfo?: Streamable<CursorPaginationInfo>;
  compareHref?: string;
  compareLabel?: Streamable<string>;
  showCompare?: Streamable<boolean>;
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
  removeLabel?: Streamable<string>;
  maxItems?: number;
  maxCompareLimitMessage?: Streamable<string>;
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
  compareHref,
  compareLabel,
  showCompare,
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
  removeLabel,
  maxItems,
  maxCompareLimitMessage,
}: Props) {
  return (
    <div className="group/products-list-section @container">
      <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-12">
        <div>
          <Stream fallback={<BreadcrumbsSkeleton />} value={streamableBreadcrumbs}>
            {(breadcrumbs) =>
              breadcrumbs && breadcrumbs.length > 1 && <Breadcrumbs breadcrumbs={breadcrumbs} />
            }
          </Stream>
          <div className="text-foreground flex flex-wrap items-center justify-between gap-4 pt-6 pb-8">
            <h1 className="font-heading flex items-center gap-2 text-3xl leading-none font-medium @lg:text-4xl @2xl:text-5xl">
              <Suspense
                fallback={
                  <span className="bg-contrast-100 inline-flex h-[1lh] w-[6ch] animate-pulse rounded-lg" />
                }
              >
                {title}
              </Suspense>
              <Suspense
                fallback={
                  <span className="bg-contrast-100 inline-flex h-[1lh] w-[2ch] animate-pulse rounded-lg" />
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

          <div className="flex-1 group-has-data-pending/products-list-section:animate-pulse">
            <ProductList
              compareHref={compareHref}
              compareLabel={compareLabel}
              compareParamName={compareParamName}
              compareProducts={compareProducts}
              emptyStateSubtitle={emptyStateSubtitle}
              emptyStateTitle={emptyStateTitle}
              maxCompareLimitMessage={maxCompareLimitMessage}
              maxItems={maxItems}
              placeholderCount={placeholderCount}
              products={products}
              removeLabel={removeLabel}
              showCompare={showCompare}
            />

            {paginationInfo && <CursorPagination info={paginationInfo} />}
          </div>
        </div>
      </div>
    </div>
  );
}
