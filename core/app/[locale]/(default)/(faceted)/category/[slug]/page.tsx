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

const cacheCategoryFacetedSearch = cache((categoryId: string) => {
  return { category: Number(categoryId) };
});

async function getCategory(props: Props) {
  const { slug } = await props.params;
  const categoryId = Number(slug);
  const data = await getCategoryPageData({ categoryId });

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
  const categoryId = Number(slug);
  const data = await getCategoryPageData({ categoryId });
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

async function getListProducts(props: Props): Promise<ListProduct[]> {
  const products = await getProducts(props);
  const format = await getFormatter();

  return products.map((product) => ({
    id: product.entityId.toString(),
    title: product.name,
    href: product.path,
    image: product.defaultImage
      ? { src: product.defaultImage.url, alt: product.defaultImage.altText, blurDataURL: product.defaultImage.blurDataURL }
      : undefined,
    price: pricesTransformer(product.prices, format),
    subtitle: product.brand?.name ?? undefined,
  }));
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
    { value: 'best_reviewed', label: t('byReview') },
    { value: 'lowest_price', label: t('priceAscending') },
    { value: 'highest_price', label: t('priceDescending') },
    { value: 'relevance', label: t('relevance') },
  ];
}

async function getPaginationInfo(props: Props): Promise<CursorPaginationInfo> {
  const search = await getRefinedSearch(props);

  return pageInfoTransformer(search.products.pageInfo);
}

async function getFilterLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch');

  return t('filters');
}

async function getCompareLabel(): Promise<string> {
  const t = await getTranslations('Components.ProductCard.Compare');

  return t('compare');
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

async function getEmptyStateTitle(): Promise<string | null> {
  const t = await getTranslations('Category.Empty');

  return t('title');
}

async function getEmptyStateSubtitle(): Promise<string | null> {
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

  return {
    title: pageTitle || category.name,
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
  };
}

export default async function Category(props: Props) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  return (
    <>
      <ProductsListSection
        breadcrumbs={getBreadcrumbs(props)}
        compareLabel={getCompareLabel()}
        emptyStateSubtitle={getEmptyStateSubtitle()}
        emptyStateTitle={getEmptyStateTitle()}
        filterLabel={await getFilterLabel()}
        filters={getFilters(props)}
        filtersPanelTitle={getFiltersPanelTitle()}
        paginationInfo={getPaginationInfo(props)}
        products={getListProducts(props)}
        rangeFilterApplyLabel={getRangeFilterApplyLabel()}
        resetFiltersLabel={getResetFiltersLabel()}
        sortDefaultValue="featured"
        sortLabel={getSortLabel()}
        sortOptions={getSortOptions()}
        sortParamName="sort"
        title={getTitle(props)}
        totalCount={getTotalCount(props)}
      />
      <Stream value={Promise.all([getCategory(props), getProducts(props)])}>
        {([category, products]) => (
          <CategoryViewed category={category} categoryId={category.entityId} products={products} />
        )}
      </Stream>
    </>
  );
}
