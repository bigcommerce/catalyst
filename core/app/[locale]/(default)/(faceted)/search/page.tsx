import { getFormatter, getTranslations } from 'next-intl/server';

import { Breadcrumb } from '@/vibes/soul/primitives/breadcrumbs';
import { CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { ListProduct } from '@/vibes/soul/primitives/products-list';
import { ProductsListSection } from '@/vibes/soul/sections/products-list-section';
import { Filter } from '@/vibes/soul/sections/products-list-section/filters-panel';
import { Option as SortOption } from '@/vibes/soul/sections/products-list-section/sorting';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

import { createFiltersSearchParamCache } from '../create-filters-search-params-cache';
import { fetchFacetedSearch } from '../fetch-faceted-search';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function getSearchTerm(searchParamsPromise: SearchParams): Promise<string> {
  const searchParams = await searchParamsPromise;
  const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : '';

  return searchTerm;
}

async function getSearch(
  searchParamsPromise: Promise<Record<string, string | string[] | undefined>>,
) {
  const searchParams = await searchParamsPromise;
  const searchParamsCache = await createFiltersSearchParamCache(await searchParamsPromise);
  const parsedSearchParams = searchParamsCache.parse(searchParams);
  const search = await fetchFacetedSearch({ ...searchParams, ...parsedSearchParams });

  return search;
}

async function getProducts(
  searchParamsPromise: Promise<Record<string, string | string[] | undefined>>,
) {
  const searchTerm = await getSearchTerm(searchParamsPromise);

  if (searchTerm === '') {
    return [];
  }

  const search = await getSearch(searchParamsPromise);

  return search.products.items;
}

async function getTitle(searchParamsPromise: SearchParams): Promise<string> {
  const searchTerm = await getSearchTerm(searchParamsPromise);
  const t = await getTranslations('Search');

  return `${t('searchResults')} "${searchTerm}"`;
}

async function getFilters(
  searchParamsPromise: Promise<Record<string, string | string[] | undefined>>,
): Promise<Filter[]> {
  const searchParams = await searchParamsPromise;
  const searchTerm = await getSearchTerm(searchParamsPromise);
  const searchParamsCache = await createFiltersSearchParamCache(searchParams);
  const parsedSearchParams = searchParamsCache.parse(searchParams);

  let refinedSearch: Awaited<ReturnType<typeof fetchFacetedSearch>> | null = null;

  if (searchTerm !== '') {
    refinedSearch = await fetchFacetedSearch({
      ...searchParams,
      ...parsedSearchParams,
    });
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

async function getListProducts(
  searchParamsPromise: Promise<Record<string, string | string[] | undefined>>,
): Promise<ListProduct[]> {
  const products = await getProducts(searchParamsPromise);
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

async function getTotalCount(
  searchParamsPromise: Promise<Record<string, string | string[] | undefined>>,
): Promise<number> {
  const searchTerm = await getSearchTerm(searchParamsPromise);

  if (searchTerm === '') {
    return 0;
  }

  const search = await getSearch(searchParamsPromise);

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

async function getPaginationInfo(
  searchParamsPromise: Promise<Record<string, string | string[] | undefined>>,
): Promise<CursorPaginationInfo> {
  const searchTerm = await getSearchTerm(searchParamsPromise);

  if (searchTerm === '') {
    return {
      startCursorParamName: 'before',
      endCursorParamName: 'after',
      endCursor: null,
      startCursor: null,
    };
  }

  const search = await getSearch(searchParamsPromise);
  const { hasNextPage, hasPreviousPage, endCursor, startCursor } = search.products.pageInfo;

  return {
    startCursorParamName: 'before',
    endCursorParamName: 'after',
    endCursor: hasNextPage ? endCursor : null,
    startCursor: hasPreviousPage ? startCursor : null,
  };
}

async function getFilterLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch');

  return t('filters');
}

async function getEmptyStateTitle(searchParamsPromise: SearchParams): Promise<string> {
  const searchTerm = await getSearchTerm(searchParamsPromise);
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

export async function generateMetadata() {
  const t = await getTranslations('Search');

  return {
    title: t('title'),
  };
}

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <ProductsListSection
      breadcrumbs={getBreadcrumbs()}
      emptyStateSubtitle={getEmptyStateSubtitle()}
      emptyStateTitle={getEmptyStateTitle(searchParams)}
      filterLabel={await getFilterLabel()}
      filters={getFilters(searchParams)}
      paginationInfo={getPaginationInfo(searchParams)}
      products={getListProducts(searchParams)}
      sortDefaultValue="featured"
      sortLabel={getSortLabel()}
      sortOptions={getSortOptions()}
      sortParamName="sort"
      title={getTitle(searchParams)}
      totalCount={getTotalCount(searchParams)}
    />
  );
}
