import { Metadata } from 'next';
import { getFormatter, getTranslations } from 'next-intl/server';
import { createSearchParamsCache } from 'nuqs/server';
import { cache } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { createCompareLoader } from '@/vibes/soul/primitives/compare-drawer/loader';
import { CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { Product } from '@/vibes/soul/primitives/product-card';
import { Breadcrumb } from '@/vibes/soul/sections/breadcrumbs';
import { ProductsListSection } from '@/vibes/soul/sections/products-list-section';
import { getFilterParsers } from '@/vibes/soul/sections/products-list-section/filter-parsers';
import { Filter } from '@/vibes/soul/sections/products-list-section/filters-panel';
import { Option as SortOption } from '@/vibes/soul/sections/products-list-section/sorting';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

import { MAX_COMPARE_LIMIT } from '../../compare/page-data';
import { getCompareProducts as getCompareProductsData } from '../fetch-compare-products';
import { fetchFacetedSearch } from '../fetch-faceted-search';

import { getSearchPageData } from './page-data';

const createSearchSearchParamsCache = cache(async (props: Props) => {
  const searchParams = await props.searchParams;
  const search = await fetchFacetedSearch(searchParams);
  const searchFacets = search.facets.items;
  const transformedSearchFacets = await facetsTransformer({
    refinedFacets: searchFacets,
    allFacets: searchFacets,
    searchParams: {},
  });
  const searchFilters = transformedSearchFacets.filter((facet) => facet != null);
  const filterParsers = getFilterParsers(searchFilters);

  // If there are no filters, return `null`, since calling `createSearchParamsCache` with an empty
  // object will throw the following cryptic error:
  //
  // ```
  // Error: [nuqs] Empty search params cache. Search params can't be accessed in Layouts.
  //   See https://err.47ng.com/NUQS-500
  // ```
  if (Object.keys(filterParsers).length === 0) {
    return null;
  }

  return createSearchParamsCache(filterParsers);
});

const getRefinedSearch = cache(async (props: Props) => {
  const searchParams = await props.searchParams;
  const searchParamsCache = await createSearchSearchParamsCache(props);
  const parsedSearchParams = searchParamsCache?.parse(searchParams) ?? {};

  return await fetchFacetedSearch({
    ...searchParams,
    ...parsedSearchParams,
  });
});

async function getSearchTerm(props: Props): Promise<string> {
  const searchParams = await props.searchParams;
  const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : '';

  return searchTerm;
}

const getSearch = cache(async (props: Props) => {
  const search = await getRefinedSearch(props);

  return search;
});

async function getProducts(props: Props) {
  const searchTerm = await getSearchTerm(props);

  if (searchTerm === '') {
    return [];
  }

  const search = await getSearch(props);

  return search.products.items;
}

async function getTitle(props: Props): Promise<string> {
  const searchTerm = await getSearchTerm(props);
  const t = await getTranslations('Search');

  return `${t('searchResults')} "${searchTerm}"`;
}

async function getFilters(props: Props): Promise<Filter[]> {
  const searchParams = await props.searchParams;
  const searchTerm = await getSearchTerm(props);
  const searchParamsCache = await createSearchSearchParamsCache(props);
  const parsedSearchParams = searchParamsCache?.parse(searchParams) ?? {};

  let refinedSearch: Awaited<ReturnType<typeof fetchFacetedSearch>> | null = null;

  if (searchTerm !== '') {
    refinedSearch = await getRefinedSearch(props);
  }

  const categorySearch = await fetchFacetedSearch({});
  const allFacets = categorySearch.facets.items.filter(
    (facet) => facet.__typename !== 'CategorySearchFilter',
  );

  const refinedFacets =
    refinedSearch?.facets.items.filter((facet) => facet.__typename !== 'CategorySearchFilter') ??
    [];
  const transformedFacets = await facetsTransformer({
    refinedFacets,
    allFacets,
    searchParams: { ...searchParams, ...parsedSearchParams },
  });

  return transformedFacets.filter((facet) => facet != null);
}

async function getListProducts(props: Props): Promise<Product[]> {
  const products = await getProducts(props);
  const format = await getFormatter();

  return products.map((product) => ({
    id: product.entityId.toString(),
    title: product.name,
    href: product.path,
    image: product.defaultImage
      ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
      : undefined,
    price: pricesTransformer(product.prices, format),
    subtitle: product.brand?.name ?? undefined,
  }));
}

async function getTotalCount(props: Props): Promise<number> {
  const searchTerm = await getSearchTerm(props);

  if (searchTerm === '') {
    return 0;
  }

  const search = await getSearch(props);

  return search.products.collectionInfo?.totalItems ?? 0;
}

async function getSortLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.SortBy');

  return t('ariaLabel');
}

async function getSortOptions(): Promise<SortOption[]> {
  const t = await getTranslations('FacetedGroup.SortBy');

  return [
    { value: 'featured', label: t('featuredItems') },
    { value: 'newest', label: t('newestItems') },
    { value: 'best_selling', label: t('bestSellingItems') },
    { value: 'a_to_z', label: t('aToZ') },
    { value: 'z_to_a', label: t('zToA') },
    { value: 'best_reviewed', label: t('byReview') },
    { value: 'lowest_price', label: t('priceAscending') },
    { value: 'highest_price', label: t('priceDescending') },
    { value: 'relevance', label: t('relevance') },
  ];
}

async function getPaginationInfo(props: Props): Promise<CursorPaginationInfo> {
  const searchTerm = await getSearchTerm(props);

  if (searchTerm === '') {
    return {
      startCursorParamName: 'before',
      endCursorParamName: 'after',
      endCursor: null,
      startCursor: null,
    };
  }

  const search = await getSearch(props);
  const { hasNextPage, hasPreviousPage, endCursor, startCursor } = search.products.pageInfo;

  return {
    startCursorParamName: 'before',
    endCursorParamName: 'after',
    endCursor: hasNextPage ? endCursor : null,
    startCursor: hasPreviousPage ? startCursor : null,
  };
}

async function getShowCompare() {
  const data = await getSearchPageData();

  return data.settings?.storefront.catalog?.productComparisonsEnabled ?? false;
}

const cachedCompareProductIds = cache(async (props: Props) => {
  const searchParams = await props.searchParams;

  const compareLoader = createCompareLoader();

  const { compare } = compareLoader(searchParams);

  return { entityIds: compare ? compare.map((id: string) => Number(id)) : [] };
});

async function getCompareProducts(props: Props) {
  const compareIds = await cachedCompareProductIds(props);

  const products = await getCompareProductsData(compareIds);

  return products.map((product) => ({
    id: product.entityId.toString(),
    title: product.name,
    image: product.defaultImage
      ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
      : undefined,
    href: product.path,
  }));
}

async function getFilterLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch');

  return t('filters');
}

async function getCompareLabel(): Promise<string> {
  const t = await getTranslations('Components.ProductCard.Compare');

  return t('compare');
}

async function getRemoveLabel(): Promise<string> {
  const t = await getTranslations('Components.ProductCard.Compare');

  return t('remove');
}

async function getMaxCompareLimitMessage(): Promise<string> {
  const t = await getTranslations('Components.ProductCard.Compare');

  return t('maxCompareLimit');
}

async function getFiltersPanelTitle(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch');

  return t('filters');
}

async function getResetFiltersLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch');

  return t('resetFilters');
}

async function getRangeFilterApplyLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch.Range');

  return t('apply');
}

async function getEmptyStateTitle(props: Props): Promise<string> {
  const searchTerm = await getSearchTerm(props);
  const t = await getTranslations('Search');

  return t('emptyStateTitle', { term: searchTerm });
}

async function getEmptyStateSubtitle(): Promise<string> {
  const t = await getTranslations('Search');

  return t('emptyStateSubtitle');
}

async function getBreadcrumbs(): Promise<Breadcrumb[]> {
  const t = await getTranslations('Search');

  return [
    { label: t('Breadcrumbs.home'), href: '/' },
    { label: t('Breadcrumbs.search'), href: `#` },
  ];
}

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Search');

  return {
    title: t('title'),
  };
}

export default async function Search(props: Props) {
  return (
    <ProductsListSection
      breadcrumbs={Streamable.from(getBreadcrumbs)}
      compareLabel={Streamable.from(getCompareLabel)}
      compareProducts={Streamable.from(() => getCompareProducts(props))}
      emptyStateSubtitle={Streamable.from(getEmptyStateSubtitle)}
      emptyStateTitle={Streamable.from(() => getEmptyStateTitle(props))}
      filterLabel={await getFilterLabel()}
      filters={Streamable.from(() => getFilters(props))}
      filtersPanelTitle={Streamable.from(getFiltersPanelTitle)}
      maxCompareLimitMessage={Streamable.from(getMaxCompareLimitMessage)}
      maxItems={MAX_COMPARE_LIMIT}
      paginationInfo={Streamable.from(() => getPaginationInfo(props))}
      products={Streamable.from(() => getListProducts(props))}
      rangeFilterApplyLabel={Streamable.from(getRangeFilterApplyLabel)}
      removeLabel={Streamable.from(getRemoveLabel)}
      resetFiltersLabel={Streamable.from(getResetFiltersLabel)}
      showCompare={Streamable.from(getShowCompare)}
      sortDefaultValue="featured"
      sortLabel={Streamable.from(getSortLabel)}
      sortOptions={Streamable.from(getSortOptions)}
      sortParamName="sort"
      title={Streamable.from(() => getTitle(props))}
      totalCount={Streamable.from(() => getTotalCount(props))}
    />
  );
}
