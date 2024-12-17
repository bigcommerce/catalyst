import { Sliders } from 'lucide-react';
import { Suspense } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Breadcrumb, Breadcrumbs, BreadcrumbsSkeleton } from '@/vibes/soul/primitives/breadcrumbs';
import { Button } from '@/vibes/soul/primitives/button';
import {
  CursorPagination,
  CursorPaginationInfo,
  CursorPaginationSkeleton,
} from '@/vibes/soul/primitives/cursor-pagination';
import { ListProduct, ProductsList } from '@/vibes/soul/primitives/products-list';
import * as SidePanel from '@/vibes/soul/primitives/side-panel';

import { ProductListTransitionProvider } from './context';
import { Filter, FiltersPanel } from './filters-panel';
import { ProductListContainer } from './product-list-container';
import { Sorting, Option as SortOption } from './sorting';

interface Props {
  breadcrumbs?: Streamable<Breadcrumb[] | null>;
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
  sortLabel?: Streamable<string | null>;
  sortParamName?: string;
  sortDefaultValue?: string;
  compareParamName?: string;
  emptyStateSubtitle?: Streamable<string | null>;
  emptyStateTitle?: Streamable<string | null>;
  placeholderCount?: number;
}

export function ProductsListSection({
  breadcrumbs: streamableBreadcrumbs,
  title = 'Products',
  totalCount,
  products,
  compareProducts,
  sortOptions,
  sortDefaultValue,
  filters,
  compareAction,
  compareLabel,
  paginationInfo,
  filterLabel = 'Filters',
  resetFiltersLabel,
  sortLabel,
  sortParamName,
  compareParamName,
  emptyStateSubtitle,
  emptyStateTitle,
  placeholderCount = 8,
}: Props) {
  return (
    <ProductListTransitionProvider>
      <div className="@container">
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
                <Sorting
                  defaultValue={sortDefaultValue}
                  label={sortLabel}
                  options={sortOptions}
                  paramName={sortParamName}
                />
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
                    <SidePanel.Content title={filterLabel}>
                      <Suspense>
                        <FiltersPanel
                          filters={filters}
                          paginationInfo={paginationInfo}
                          resetFiltersLabel={resetFiltersLabel}
                        />
                      </Suspense>
                    </SidePanel.Content>
                  </SidePanel.Root>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-stretch gap-8 @4xl:gap-10">
            <div className="hidden w-52 @3xl:block @4xl:w-60">
              <FiltersPanel
                className="sticky top-4"
                filters={filters}
                paginationInfo={paginationInfo}
                resetFiltersLabel={resetFiltersLabel}
              />
            </div>

            <ProductListContainer className="flex-1">
              <ProductsList
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
              <Stream fallback={<CursorPaginationSkeleton />} value={paginationInfo}>
                {(info) => info && <CursorPagination info={info} />}
              </Stream>
            </ProductListContainer>
          </div>
        </div>
      </div>
    </ProductListTransitionProvider>
  );
}
