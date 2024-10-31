import { Breadcrumb, Breadcrumbs } from '@/vibes/soul/primitives/breadcrumbs'
import { ListProduct, ProductsList } from '@/vibes/soul/primitives/products-list'

import { Filter, FiltersPanel } from './filters-panel'
import { MobileFilters } from './mobile-filters'
import { Pagination, PaginationInfo } from './pagination'
import { Option as SortOption } from './sorting'
import { Sorting } from './sorting'

interface Pages {
  name: string
  previousPage?: string
  nextPage?: string
}
interface Props {
  breadcrumbs?: Breadcrumb[]
  title?: Promise<string> | string
  totalCount: Promise<number> | number
  products: Promise<ListProduct[]> | ListProduct[]
  filters: Promise<Filter[]> | Filter[]
  sortOptions: Promise<SortOption[]> | SortOption[]
  compareProducts?: Promise<ListProduct[]> | ListProduct[]
  pagination?: Promise<Pages> | Pages
  paginationInfo?: Promise<PaginationInfo> | PaginationInfo
  compareLabel?: string
  filterLabel?: string
  sortLabel?: string
  sortParamName?: string
  compareParamName?: string
}

export function ProductsListSection({
  breadcrumbs,
  title = 'Products',
  totalCount,
  products,
  compareProducts,
  sortOptions,
  filters,
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
        <h1 className="text-3xl font-medium leading-none @lg:text-4xl @2xl:text-5xl ">
          {title} <span className="text-contrast-300">{totalCount}</span>
        </h1>
        <div className="flex gap-2">
          <Sorting options={sortOptions} label={sortLabel} paramName={sortParamName} />
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
            products={products}
            showCompare
            compareLabel={compareLabel}
            compareParamName={compareParamName}
            compareProducts={compareProducts}
          />
          {paginationInfo && <Pagination info={paginationInfo} />}
        </div>
      </div>
    </div>
  )
}
