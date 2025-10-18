import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { createSearchParamsCache } from 'nuqs/server';
import { cache } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { createCompareLoader } from '@/vibes/soul/primitives/compare-drawer/loader';
import { CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { Product } from '@/vibes/soul/primitives/product-card';
import { Breadcrumb } from '@/vibes/soul/sections/breadcrumbs';
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

import { CategoryViewed } from './_components/category-viewed';
import { getCategoryPageData } from './page-data';

const cachedCategoryDataVariables = cache((categoyId: string) => {
  return {
    categoryId: Number(categoyId),
  };
});

const cacheCategoryFacetedSearch = cache((categoryId: string) => {
  return { category: Number(categoryId) };
});

async function getCategory(props: Props) {
  const { slug } = await props.params;

  const variables = cachedCategoryDataVariables(slug);
  const data = await getCategoryPageData(variables);

  const category = data.category;

  if (category == null) notFound();

  return category;
}

const createCategorySearchParamsCache = cache(async (props: Props) => {
  const { slug } = await props.params;
  const category = cacheCategoryFacetedSearch(slug);
  const categorySearch = await fetchFacetedSearch(category);
  const categoryFacets = categorySearch.facets.items.filter(
    (facet) => facet.__typename !== 'CategorySearchFilter',
  );
  const transformedCategoryFacets = await facetsTransformer({
    refinedFacets: categoryFacets,
    allFacets: categoryFacets,
    searchParams: {},
  });
  const categoryFilters = transformedCategoryFacets.filter((facet) => facet != null);
  const filterParsers = getFilterParsers(categoryFilters);

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
  const categoryId = Number(slug);
  const searchParams = await props.searchParams;
  const searchParamsCache = await createCategorySearchParamsCache(props);
  const parsedSearchParams = searchParamsCache?.parse(searchParams) ?? {};

  return await fetchFacetedSearch({
    ...searchParams,
    ...parsedSearchParams,
    category: categoryId,
  });
});

async function getBreadcrumbs(props: Props): Promise<Breadcrumb[]> {
  const category = await getCategory(props);

  return removeEdgesAndNodes(category.breadcrumbs).map(({ name, path }) => ({
    label: name,
    href: path ?? '#',
  }));
}

async function getSubCategoriesFilters(props: Props): Promise<Filter[]> {
  const { slug } = await props.params;

  const variables = cachedCategoryDataVariables(slug);
  const data = await getCategoryPageData(variables);
  const t = await getTranslations('FacetedGroup.MobileSideNav');

  const categoryTree = data.categoryTree[0];

  if (categoryTree == null || categoryTree.children.length === 0) return [];

  return [
    {
      type: 'link-group',
      label: t('subCategories'),
      links: categoryTree.children.map((category) => ({
        label: category.name,
        href: category.path,
        id: category.entityId.toString(),
        productCount: category.productCount,
        image: {
          src: category.image?.urlOriginal ?? undefined,
          alt: category.image?.altText ?? undefined,
        },
      })),
    },
  ];
}

async function getTitle(props: Props): Promise<string | null> {
  const category = await getCategory(props);

  return category.name;
}

const getSearch = cache(async (props: Props) => {
  const search = await getRefinedSearch(props);

  return search;
});

async function getTotalCount(props: Props): Promise<number> {
  const search = await getSearch(props);

  return search.products.collectionInfo?.totalItems ?? 0;
}

async function getProducts(props: Props) {
  const search = await getSearch(props);

  return search.products.items;
}

async function getListProducts(props: Props): Promise<Product[]> {
  const products = await getProducts(props);
  const format = await getFormatter();

  return products.map((product) => ({
    id: product.entityId.toString(),
    title: product.name,
    href: product.path,
    categories: [],
    description: product.description,
    badge: '',
    image: product.defaultImage
      ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
      : undefined,
    price: pricesTransformer(product.prices, format),
    subtitle: product.brand?.name ?? undefined,
  }));
}

async function getCategoryFeaturedImage(props: Props): Promise<string | null> {
  const category = await getCategory(props);

  return category.defaultImage ? category.defaultImage.urlOriginal : null;
}

async function getCategoryDescription(props: Props): Promise<string | null> {
  const category = await getCategory(props);

  return category.description ? category.description : null;
}

async function getFilters(props: Props): Promise<Filter[]> {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const searchParamsCache = await createCategorySearchParamsCache(props);
  const parsedSearchParams = searchParamsCache?.parse(searchParams) ?? {};
  const category = cacheCategoryFacetedSearch(slug);
  const categorySearch = await fetchFacetedSearch(category);
  const refinedSearch = await getRefinedSearch(props);

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

  const filters = transformedFacets.filter((facet) => facet != null);
  const subCategoriesFilters = await getSubCategoriesFilters(props);

  return [...subCategoriesFilters, ...filters];
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
    // { value: 'best_reviewed', label: t('byReview') },
    { value: 'lowest_price', label: t('priceAscending') },
    { value: 'highest_price', label: t('priceDescending') },
    { value: 'relevance', label: t('relevance') },
  ];
}

async function getPaginationInfo(props: Props): Promise<CursorPaginationInfo> {
  const search = await getRefinedSearch(props);

  return pageInfoTransformer(search.products.pageInfo);
}

async function getShowCompare(props: Props) {
  const { slug } = await props.params;

  const variables = cachedCategoryDataVariables(slug);
  const data = await getCategoryPageData(variables);

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

async function getRangeFilterApplyLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch.Range');

  return t('apply');
}

async function getResetFiltersLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch');

  return t('resetFilters');
}

async function getEmptyStateTitle(): Promise<string> {
  const t = await getTranslations('Category.Empty');

  return t('title');
}

async function getEmptyStateSubtitle(): Promise<string> {
  const t = await getTranslations('Category.Empty');

  return t('subtitle');
}

type SearchParams = Record<string, string | string[] | undefined>;

interface Props {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const category = await getCategory(props);

  const { pageTitle, metaDescription, metaKeywords } = category.seo;

  const canonicalUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}${category.path}`
    : `https://gitool.com${category.path}`;

  return {
    title: pageTitle || category.name,
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function Category(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  // Fetch all data server-side in parallel
  const [
    breadcrumbs,
    compareLabel,
    categoryImage,
    compareProducts,
    emptyStateSubtitle,
    description,
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
    category,
    rawProducts,
  ] = await Promise.all([
    getBreadcrumbs(props),
    getCompareLabel(),
    getCategoryFeaturedImage(props),
    getCompareProducts(props),
    getEmptyStateSubtitle(),
    getCategoryDescription(props),
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
    getCategory(props),
    getProducts(props),
  ]);

  return (
    <>
      <ProductsListSection
        breadcrumbs={breadcrumbs}
        compareLabel={compareLabel}
        categoryImage={categoryImage}
        // @ts-ignore
        compareProducts={compareProducts}
        emptyStateSubtitle={emptyStateSubtitle}
        description={description}
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
      <CategoryViewed category={category} categoryId={category.entityId} products={rawProducts} />
    </>
  );
}
