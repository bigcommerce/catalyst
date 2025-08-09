import { Sliders } from 'lucide-react';
import { Suspense } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Button } from '@/vibes/soul/primitives/button';
import { CursorPagination, CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { Product } from '@/vibes/soul/primitives/product-card';
import * as SidePanel from '@/vibes/soul/primitives/side-panel';
import { Breadcrumb, Breadcrumbs, BreadcrumbsSkeleton } from '@/vibes/soul/sections/breadcrumbs';
import { ProductList } from '@/vibes/soul/sections/product-list';
import { Filter, FiltersPanel } from '@/vibes/soul/sections/products-list-section/filters-panel';
import {
  Sorting,
  SortingSkeleton,
  Option as SortOption,
} from '@/vibes/soul/sections/products-list-section/sorting';

interface Props {
  breadcrumbs?: Streamable<Breadcrumb[]>;
  title?: Streamable<string | null>;
  totalCount: Streamable<number>;
  products: Streamable<Product[]>;
  filters: Streamable<Filter[]>;
  sortOptions: Streamable<SortOption[]>;
  categoryImage: Streamable<string | null>;
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
  description?: Streamable<string | null>;
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
  categoryImage,
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
  description,
}: Props) {
  return (
    <div className="group/products-list-section @container">
      {/**
       * CATEGORY FEATURED IMAGE
       */}
      {/* <div className="relative mx-auto flex h-[200px] w-full max-w-screen-2xl items-center justify-center overflow-hidden rounded-lg bg-contrast-100">
        <Suspense
          fallback={
            <span className="inline-flex h-[1lh] w-[6ch] animate-pulse rounded-lg bg-contrast-100" />
          }
        >
          <Stream value={categoryImage}>
            {(resolvedCategoryImage) => (
              <img
                src={resolvedCategoryImage ? resolvedCategoryImage : DEFAULT_CATEGORY_IMAGE_URL}
                alt=""
                className="h-full w-full bg-white object-contain object-center"
              />
            )}
          </Stream>
        </Suspense>
      </div> */}

      <div className="mx-auto max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-12">
        <div>
          <Stream fallback={<BreadcrumbsSkeleton />} value={streamableBreadcrumbs}>
            {(breadcrumbs) =>
              breadcrumbs && breadcrumbs.length > 1 && <Breadcrumbs breadcrumbs={breadcrumbs} />
            }
          </Stream>
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 pt-6 text-foreground">
            <h1 className="flex items-center gap-2 font-heading text-3xl font-medium leading-none @lg:text-4xl @2xl:text-5xl">
              <Suspense
                fallback={
                  <span className="inline-flex h-[1lh] w-[6ch] animate-pulse rounded-lg bg-contrast-100" />
                }
              >
                {title}
              </Suspense>
              {/* <Suspense
                fallback={
                  <span className="inline-flex h-[1lh] w-[2ch] animate-pulse rounded-lg bg-contrast-100" />
                }
              >
                <span className="text-contrast-300">{totalCount}</span>
              </Suspense> */}
            </h1>

            {/**
             * Section to add category description that comes before the three pipes "|||"
             */}

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

        {description && (
          <Stream value={description}>
            {(resolvedDescription) =>
              resolvedDescription && resolvedDescription !== undefined ? (
                <div
                  className="mb-8 max-w-7xl"
                  // @ts-ignore
                  dangerouslySetInnerHTML={{ __html: resolvedDescription.split('|||')[0] }}
                />
              ) : null
            }
          </Stream>
        )}

        {/**
         * GRID OF ITEMS FOR THE SUB CATEGORIES
         */}
        <div className="hidden @3xl:block @4xl:w-full">
          <FiltersPanel
            className="sticky top-4 mb-4"
            filters={filters}
            paginationInfo={paginationInfo}
            rangeFilterApplyLabel={rangeFilterApplyLabel}
            resetFiltersLabel={resetFiltersLabel}
          />
        </div>

        <div className="mt-6 flex items-stretch gap-8 @4xl:gap-10">
          <div className="flex-1 group-has-[[data-pending]]/products-list-section:animate-pulse">
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
              aspectRatio="1:1"
            />

            {paginationInfo && <CursorPagination info={paginationInfo} />}
          </div>
        </div>

        {/**
         * Section to add category description that comes after the three pipes "|||"
         */}
        {description && (
          <Stream value={description}>
            {(resolvedDescription) =>
              resolvedDescription && resolvedDescription.split('|||').length > 1 ? (
                // @ts-ignore
                <div dangerouslySetInnerHTML={{ __html: resolvedDescription.split('|||')[1] }} />
              ) : null
            }
          </Stream>
        )}
      </div>
    </div>
  );
}
