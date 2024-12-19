import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { createSearchParamsCache } from 'nuqs/server';
import { cache } from 'react';

import { Stream } from '@/vibes/soul/lib/streamable';
import { Breadcrumb } from '@/vibes/soul/primitives/breadcrumbs';
import { CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { ListProduct } from '@/vibes/soul/primitives/products-list';
import { ProductsListSection } from '@/vibes/soul/sections/products-list-section';
import { getFilterParsers } from '@/vibes/soul/sections/products-list-section/filter-parsers';
import { Filter } from '@/vibes/soul/sections/products-list-section/filters-panel';
import { Option as SortOption } from '@/vibes/soul/sections/products-list-section/sorting';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { pageInfoTransformer } from '~/data-transformers/page-info-transformer';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

import { fetchFacetedSearch } from '../../fetch-faceted-search';

import { CategoryViewed } from './_components/category-viewed';
import { getCategoryPageData } from './page-data';

type SearchParams = Record<string, string | string[] | undefined>;

const createFiltersSearchParamCache = cache(async (categoryId: number) => {
  const search = await fetchFacetedSearch({ category: categoryId });
  const facets = search.facets.items.filter((facet) => facet.__typename !== 'CategorySearchFilter');
  const transformedFacets = await facetsTransformer({
    refinedFacets: facets,
    allFacets: facets,
    searchParams: {},
  });
  const filters = transformedFacets.filter((facet) => facet != null);

  return createSearchParamsCache(getFilterParsers(filters));
});

async function getCategory(categoryId: number) {
  const data = await getCategoryPageData({ categoryId });

  const category = data.category;

  if (category == null) notFound();

  return category;
}

async function getBreadcrumbs(categoryId: number): Promise<Breadcrumb[]> {
  const category = await getCategory(categoryId);

  return removeEdgesAndNodes(category.breadcrumbs).map(({ name, path }) => ({
    label: name,
    href: path ?? '#',
  }));
}

async function getTitle(categoryId: number): Promise<string | null> {
  const category = await getCategory(categoryId);

  return category.name;
}

async function getSearch(categoryId: number, searchParamsPromise: Promise<SearchParams>) {
  const searchParams = await searchParamsPromise;
  const searchParamsCache = await createFiltersSearchParamCache(categoryId);
  const parsedSearchParams = searchParamsCache.parse(searchParams);
  const search = await fetchFacetedSearch({
    ...searchParams,
    ...parsedSearchParams,
    category: categoryId,
  });

  return search;
}

async function getTotalCount(
  categoryId: number,
  searchParamsPromise: Promise<SearchParams>,
): Promise<number> {
  const search = await getSearch(categoryId, searchParamsPromise);

  return search.products.collectionInfo?.totalItems ?? 0;
}

async function getProducts(categoryId: number, searchParamsPromise: Promise<SearchParams>) {
  const search = await getSearch(categoryId, searchParamsPromise);

  return search.products.items;
}

async function getListProducts(
  categoryId: number,
  searchParamsPromise: Promise<SearchParams>,
): Promise<ListProduct[]> {
  const products = await getProducts(categoryId, searchParamsPromise);
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

async function getFilters(
  categoryId: number,
  searchParamsPromise: Promise<SearchParams>,
): Promise<Filter[]> {
  const searchParams = await searchParamsPromise;
  const searchParamsCache = await createFiltersSearchParamCache(categoryId);
  const parsedSearchParams = searchParamsCache.parse(searchParams);
  const categorySearch = await fetchFacetedSearch({ category: categoryId });
  const refinedSearch = await fetchFacetedSearch({
    ...searchParams,
    ...parsedSearchParams,
    category: categoryId,
  });
  const allFacets = categorySearch.facets.items.filter(
    (facet) => facet.__typename !== 'CategorySearchFilter',
  );
  const refinedFacets = refinedSearch.facets.items.filter(
    (facet) => facet.__typename !== 'CategorySearchFilter',
  );

  const transformedFacets = await facetsTransformer({
    refinedFacets,
    allFacets,
    searchParams: { ...searchParams, ...parsedSearchParams },
  });

  return transformedFacets.filter((facet) => facet != null);
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
  categoryId: number,
  searchParamsPromise: Promise<SearchParams>,
): Promise<CursorPaginationInfo> {
  const searchParams = await searchParamsPromise;
  const searchParamsCache = await createFiltersSearchParamCache(categoryId);
  const parsedSearchParams = searchParamsCache.parse(searchParams);
  const search = await fetchFacetedSearch({
    ...searchParams,
    ...parsedSearchParams,
    category: categoryId,
  });

  return pageInfoTransformer(search.products.pageInfo);
}

async function getFilterLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch');

  return t('filters');
}

async function getEmptyStateTitle(): Promise<string | null> {
  const t = await getTranslations('Category.Empty');

  return t('title');
}

async function getEmptyStateSubtitle(): Promise<string | null> {
  const t = await getTranslations('Category.Empty');

  return t('subtitle');
}

interface Props {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categoryId = Number(slug);
  const category = await getCategory(categoryId);

  const { pageTitle, metaDescription, metaKeywords } = category.seo;

  return {
    title: pageTitle || category.name,
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
  };
}

export default async function Category({ params, searchParams }: Props) {
  const { locale, slug } = await params;

  setRequestLocale(locale);

  const categoryId = Number(slug);

  return (
    <>
      <ProductsListSection
        breadcrumbs={getBreadcrumbs(categoryId)}
        emptyStateSubtitle={getEmptyStateSubtitle()}
        emptyStateTitle={getEmptyStateTitle()}
        filterLabel={await getFilterLabel()}
        filters={getFilters(categoryId, searchParams)}
        paginationInfo={getPaginationInfo(categoryId, searchParams)}
        products={getListProducts(categoryId, searchParams)}
        sortDefaultValue="featured"
        sortLabel={getSortLabel()}
        sortOptions={getSortOptions()}
        sortParamName="sort"
        title={getTitle(categoryId)}
        totalCount={getTotalCount(categoryId, searchParams)}
      />
      <Stream value={Promise.all([getCategory(categoryId), getProducts(categoryId, searchParams)])}>
        {([category, products]) => (
          <CategoryViewed category={category} categoryId={categoryId} products={products} />
        )}
      </Stream>
    </>
  );
}
