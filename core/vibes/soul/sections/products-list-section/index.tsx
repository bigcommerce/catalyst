import { Breadcrumb, Breadcrumbs } from '@/vibes/soul/primitives/breadcrumbs';
import { CursorPagination, CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { ListProduct, ProductsList } from '@/vibes/soul/primitives/products-list';

import { Filter, FiltersPanel } from './filters-panel';
import { MobileFilters } from './mobile-filters';
import { Sorting, Option as SortOption } from './sorting';

interface Props {
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
  sortLabel?: string;
  sortParamName?: string;
  compareParamName?: string;
}

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
  sortLabel,
  sortParamName,
  compareParamName,
}: Props) {
  return (
    <div className="mx-auto max-w-7xl @container">
      {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-8 pt-6 text-foreground">
        <h1 className="text-3xl font-medium leading-none @lg:text-4xl @2xl:text-5xl">
          {title} <span className="text-contrast-300">{totalCount}</span>
        </h1>
        <div className="flex gap-2">
          <Sorting label={sortLabel} options={sortOptions} paramName={sortParamName} />
          <div className="block @3xl:hidden">
            <MobileFilters filters={filters} label={filterLabel} />
          </div>
        </div>
      </div>
      <div className="flex gap-8 @4xl:gap-10">
        <div className="hidden w-52 @3xl:block @4xl:w-60">
          <FiltersPanel filters={filters} />
        </div>
        <div className="flex-1">
          <ProductsList
            compareAction={compareAction}
            compareLabel={compareLabel}
            compareParamName={compareParamName}
            compareProducts={compareProducts}
            products={products}
            showCompare
          />
          {paginationInfo && <CursorPagination info={paginationInfo} />}
        </div>
      </div>
    </div>
  );
}
