import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { createSearchParamsCache } from 'nuqs/server';
import { cache } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { createCompareLoader } from '@/vibes/soul/primitives/compare-drawer/loader';
import { CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { Product } from '@/vibes/soul/primitives/product-card';
import { ProductsListSection } from '@/vibes/soul/sections/products-list-section';
import { getFilterParsers } from '@/vibes/soul/sections/products-list-section/filter-parsers';
import { Filter } from '@/vibes/soul/sections/products-list-section/filters-panel';
import { Option as SortOption } from '@/vibes/soul/sections/products-list-section/sorting';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { pageInfoTransformer } from '~/data-transformers/page-info-transformer';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

import { MAX_COMPARE_LIMIT } from '../../../compare/page-data';
import { getCompareProducts as getCompareProductsData } from '../../fetch-compare-products';
import { fetchFacetedSearch } from '../../fetch-faceted-search';

import { getBrandPageData } from './page-data';

const cachedBrandDataVariables = cache((brandId: string) => {
  return {
    entityId: Number(brandId),
  };
});

const cacheBrandFacetedSearch = cache((brandId: string) => {
  return { brand: [brandId] };
});

async function getBrand(props: Props) {
  const { slug } = await props.params;

  const variables = cachedBrandDataVariables(slug);
  const data = await getBrandPageData(variables);

  const brand = data.brand;

  if (brand == null) notFound();

  return brand;
}

async function getTitle(props: Props): Promise<string> {
  const brand = await getBrand(props);

  return brand.name;
}

const createBrandSearchParamsCache = cache(async (props: Props) => {
  const { slug } = await props.params;
  const brand = cacheBrandFacetedSearch(slug);
  const brandSearch = await fetchFacetedSearch(brand);
  const brandFacets = brandSearch.facets.items.filter(
    (facet) => facet.__typename !== 'BrandSearchFilter',
  );
  const transformedBrandFacets = await facetsTransformer({
    refinedFacets: brandFacets,
    allFacets: brandFacets,
    searchParams: {},
  });
  const brandFilters = transformedBrandFacets.filter((facet) => facet != null);
  const filterParsers = getFilterParsers(brandFilters);

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
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const searchParamsCache = await createBrandSearchParamsCache(props);
  const parsedSearchParams = searchParamsCache?.parse(searchParams) ?? {};

  return await fetchFacetedSearch({
    ...searchParams,
    ...parsedSearchParams,
    brand: [slug],
  });
});

async function getTotalCount(props: Props): Promise<number> {
  const search = await getRefinedSearch(props);

  return search.products.collectionInfo?.totalItems ?? 0;
}

async function getFilters(props: Props): Promise<Filter[]> {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const searchParamsCache = await createBrandSearchParamsCache(props);
  const parsedSearchParams = searchParamsCache?.parse(searchParams) ?? {};
  const brand = cacheBrandFacetedSearch(slug);
  const brandSearch = await fetchFacetedSearch(brand);
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
    // { value: 'best_reviewed', label: t('byReview') },
    { value: 'lowest_price', label: t('priceAscending') },
    { value: 'highest_price', label: t('priceDescending') },
    { value: 'relevance', label: t('relevance') },
  ];
}

async function getListProducts(props: Props): Promise<Product[]> {
  const refinedSearch = await getRefinedSearch(props);
  const format = await getFormatter();

  // @ts-ignore
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
  const brandSearch = await getRefinedSearch(props);

  return pageInfoTransformer(brandSearch.products.pageInfo);
}

async function getShowCompare(props: Props) {
  const { slug } = await props.params;

  const variables = cachedBrandDataVariables(slug);
  const data = await getBrandPageData(variables);

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

async function getSortLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.SortBy');

  return t('ariaLabel');
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

async function getEmptyStateTitle(): Promise<string> {
  const t = await getTranslations('Brand');

  return t('emptyStateTitle');
}

async function getEmptyStateSubtitle(): Promise<string> {
  const t = await getTranslations('Brand');

  return t('emptyStateSubtitle');
}

async function getFiltersPanelTitle(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch');

  return t('filters');
}

async function getRangeFilterApplyLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch.Range');

  return t('apply');
}

async function getResetFiltersLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch');

  return t('resetFilters');
}

interface Props {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const brand = await getBrand(props);

  const { pageTitle, metaDescription, metaKeywords } = brand.seo;

  const canonicalUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}${brand.path}`
    : `https://gitool.com${brand.path}`;

  return {
    title: pageTitle || brand.name,
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function Brand(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  // Fetch all data server-side in parallel
  const [
    compareLabel,
    compareProducts,
    emptyStateSubtitle,
    emptyStateTitle,
    filterLabel,
    filters,
    filtersPanelTitle,
    maxCompareLimitMessage,
    paginationInfo,
    products,
    rangeFilterApplyLabel,
    removeLabel,
    resetFiltersLabel,
    showCompare,
    sortLabel,
    sortOptions,
    title,
    totalCount,
  ] = await Promise.all([
    getCompareLabel(),
    getCompareProducts(props),
    getEmptyStateSubtitle(),
    getEmptyStateTitle(),
    getFilterLabel(),
    getFilters(props),
    getFiltersPanelTitle(),
    getMaxCompareLimitMessage(),
    getPaginationInfo(props),
    getListProducts(props),
    getRangeFilterApplyLabel(),
    getRemoveLabel(),
    getResetFiltersLabel(),
    getShowCompare(props),
    getSortLabel(),
    getSortOptions(),
    getTitle(props),
    getTotalCount(props),
  ]);

  return (
    <ProductsListSection
      compareLabel={compareLabel}
      // @ts-ignore
      compareProducts={compareProducts}
      emptyStateSubtitle={emptyStateSubtitle}
      emptyStateTitle={emptyStateTitle}
      filterLabel={filterLabel}
      filters={filters}
      filtersPanelTitle={filtersPanelTitle}
      maxCompareLimitMessage={maxCompareLimitMessage}
      maxItems={MAX_COMPARE_LIMIT}
      paginationInfo={paginationInfo}
      products={products}
      rangeFilterApplyLabel={rangeFilterApplyLabel}
      removeLabel={removeLabel}
      resetFiltersLabel={resetFiltersLabel}
      showCompare={showCompare}
      sortDefaultValue="featured"
      sortLabel={sortLabel}
      sortOptions={sortOptions}
      sortParamName="sort"
      title={title}
      totalCount={totalCount}
    />
  );
}
