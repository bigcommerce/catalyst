import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { createSearchParamsCache } from 'nuqs/server';
import { cache } from 'react';

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

import { getBrand as getBrandData } from './page-data';

interface Props {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getBreadcrumbs(): Breadcrumb[] {
  return [];
}

async function getBrand(props: Props) {
  const { slug } = await props.params;
  const brand = await getBrandData({ entityId: Number(slug) });

  if (brand == null) notFound();

  return brand;
}

async function getTitle(props: Props): Promise<string> {
  const brand = await getBrand(props);

  return brand.name;
}

async function getTotalCount(props: Props): Promise<number> {
  const search = await getRefinedSearch(props);

  return search.products.collectionInfo?.totalItems ?? 0;
}

const createBrandSearchParamsCache = cache(async (props: Props) => {
  const { slug } = await props.params;
  const brandSearch = await fetchFacetedSearch({ brand: [slug] });
  const brandFacets = brandSearch.facets.items.filter(
    (facet) => facet.__typename !== 'BrandSearchFilter',
  );
  const transformedBrandFacets = await facetsTransformer({
    refinedFacets: brandFacets,
    allFacets: brandFacets,
    searchParams: {},
  });
  const brandFilters = transformedBrandFacets.filter((facet) => facet != null);

  return createSearchParamsCache(getFilterParsers(brandFilters));
});

async function getRefinedSearch(props: Props) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const searchParamsCache = await createBrandSearchParamsCache(props);
  const parsedSearchParams = searchParamsCache.parse(searchParams);

  return await fetchFacetedSearch({
    ...searchParams,
    ...parsedSearchParams,
    brand: [slug],
  });
}

async function getFilters(props: Props): Promise<Filter[]> {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const searchParamsCache = await createBrandSearchParamsCache(props);
  const parsedSearchParams = searchParamsCache.parse(searchParams);
  const brandSearch = await fetchFacetedSearch({ brand: [slug] });
  const brandFacets = brandSearch.facets.items.filter(
    (facet) => facet.__typename !== 'BrandSearchFilter',
  );
  const refinedSearch = await getRefinedSearch(props);
  const refinedFacets = refinedSearch.facets.items.filter(
    (facet) => facet.__typename !== 'BrandSearchFilter',
  );

  const transformedFacets = await facetsTransformer({
    refinedFacets,
    allFacets: brandFacets,
    searchParams: { ...searchParams, ...parsedSearchParams },
  });

  return transformedFacets.filter((facet) => facet != null);
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

async function getListProducts(props: Props): Promise<ListProduct[]> {
  const refinedSearch = await getRefinedSearch(props);
  const format = await getFormatter();

  return refinedSearch.products.items.map((product) => ({
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

async function getPaginationInfo(props: Props): Promise<CursorPaginationInfo> {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const searchParamsCache = await createBrandSearchParamsCache(props);
  const parsedSearchParams = searchParamsCache.parse(searchParams);
  const brandSearch = await fetchFacetedSearch({
    ...searchParams,
    ...parsedSearchParams,
    brand: [slug],
  });

  return pageInfoTransformer(brandSearch.products.pageInfo);
}

async function getFilterLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch');

  return t('filters');
}

async function getSortLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.SortBy');

  return t('ariaLabel');
}

async function getEmptyStateTitle(): Promise<string> {
  const t = await getTranslations('Brand');

  return t('emptyStateTitle');
}

async function getEmptyStateSubtitle(): Promise<string> {
  const t = await getTranslations('Brand');

  return t('emptyStateSubtitle');
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const brand = await getBrand(props);

  const { pageTitle, metaDescription, metaKeywords } = brand.seo;

  return {
    title: pageTitle || brand.name,
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
  };
}

export default async function Brand(props: Props) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  return (
    <ProductsListSection
      breadcrumbs={getBreadcrumbs()}
      emptyStateSubtitle={getEmptyStateSubtitle()}
      emptyStateTitle={getEmptyStateTitle()}
      filterLabel={await getFilterLabel()}
      filters={getFilters(props)}
      paginationInfo={getPaginationInfo(props)}
      products={getListProducts(props)}
      sortDefaultValue="featured"
      sortLabel={getSortLabel()}
      sortOptions={getSortOptions()}
      sortParamName="sort"
      title={getTitle(props)}
      totalCount={getTotalCount(props)}
    />
  );
}
