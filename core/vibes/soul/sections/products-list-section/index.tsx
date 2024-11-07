import { Breadcrumb, Breadcrumbs } from '@/vibes/soul/primitives/breadcrumbs';
import { CursorPagination, CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { ListProduct, ProductsList } from '@/vibes/soul/primitives/products-list';

import { Filter, FiltersPanel } from './filters-panel';
import { MobileFilters } from './mobile-filters';
import { Sorting, Option as SortOption } from './sorting';

type Props = {
  breadcrumbs?: Breadcrumb[];
  title?: Promise<string> | string;
  totalCount: Promise<number> | number;
  products: Promise<ListProduct[]> | ListProduct[];
  filters: Promise<Filter[]> | Filter[];
  sortOptions: Promise<SortOption[]> | SortOption[];
  compareProducts?: Promise<ListProduct[]> | ListProduct[];
  paginationInfo?: Promise<CursorPaginationInfo> | CursorPaginationInfo;
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
    <div className="@container">
      <div className="mx-auto max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-12">
        <div>
          {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 pt-6 text-foreground">
            <h1 className="text-3xl font-medium leading-none @lg:text-4xl @2xl:text-5xl">
              {title} <span className="text-contrast-300">{totalCount}</span>
            </h1>
            <div className="flex gap-2">
              <Sorting options={sortOptions} label={sortLabel} paramName={sortParamName} />
              <div className="block @3xl:hidden">
                <MobileFilters filters={filters} label={filterLabel} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-stretch gap-8 @4xl:gap-10">
          <div className="hidden w-52 @3xl:block @4xl:w-60">
            <FiltersPanel
              className="sticky top-4"
              filters={filters}
              resetFiltersLabel={resetFiltersLabel}
            />
          </div>

          <div className="flex-1">
            <ProductsList
              products={products}
              showCompare
              compareLabel={compareLabel}
              compareParamName={compareParamName}
              compareProducts={compareProducts}
              compareAction={compareAction}
            />
            {paginationInfo && <CursorPagination info={paginationInfo} />}
          </div>
        </div>
      </div>
    </div>
  );
}
