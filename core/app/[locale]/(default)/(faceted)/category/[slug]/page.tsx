import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { createCompareLoader } from '@/vibes/soul/primitives/compare-drawer/loader';
import { ProductsListSection } from '@/vibes/soul/sections/products-list-section';
import { getSessionCustomerAccessToken } from '~/auth';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { pageInfoTransformer } from '~/data-transformers/page-info-transformer';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';

import { MAX_COMPARE_LIMIT } from '../../../compare/page-data';
import { getCompareProducts as getCompareProductsData } from '../../fetch-compare-products';
import { fetchFacetedSearch } from '../../fetch-faceted-search';

import { getCategoryPageData } from './page-data';

// const cachedCategoryDataVariables = cache((categoyId: string) => {
//   return {
//     categoryId: Number(categoyId),
//   };
// });

// const cacheCategoryFacetedSearch = cache((categoryId: string) => {
//   return { category: Number(categoryId) };
// });

// async function getCategory(props: Props) {
//   const { slug } = await props.params;

//   const variables = cachedCategoryDataVariables(slug);
//   const data = await getCategoryPageData(variables);

//   const category = data.category;

//   if (category == null) notFound();

//   return category;
// }

// async function getSubCategoriesFilters(props: Props): Promise<Filter[]> {
//   const { slug } = await props.params;

//   const variables = cachedCategoryDataVariables(slug);
//   const data = await getCategoryPageData(variables);
//   const t = await getTranslations('Faceted.Category');

//   const categoryTree = data.categoryTree[0];

//   if (categoryTree == null || categoryTree.children.length === 0) return [];

//   return [
//     {
//       type: 'link-group',
//       label: t('subCategories'),
//       links: categoryTree.children.map((category) => ({
//         label: category.name,
//         href: category.path,
//       })),
//     },
//   ];
// }

// async function getFilters(props: Props): Promise<Filter[]> {
//   const { slug } = await props.params;
//   const searchParams = await props.searchParams;
//   const searchParamsCache = await createCategorySearchParamsCache(props);
//   const parsedSearchParams = searchParamsCache?.parse(searchParams) ?? {};
//   const category = cacheCategoryFacetedSearch(slug);
//   const categorySearch = await fetchFacetedSearch(category);
//   const refinedSearch = await getRefinedSearch(props);

//   const allFacets = categorySearch.facets.items.filter(
//     (facet) => facet.__typename !== 'CategorySearchFilter',
//   );
//   const refinedFacets = refinedSearch.facets.items.filter(
//     (facet) => facet.__typename !== 'CategorySearchFilter',
//   );

//   const transformedFacets = await facetsTransformer({
//     refinedFacets,
//     allFacets,
//     searchParams: { ...searchParams, ...parsedSearchParams },
//   });

//   const filters = transformedFacets.filter((facet) => facet != null);
//   const subCategoriesFilters = await getSubCategoriesFilters(props);

//   return [...subCategoriesFilters, ...filters];
// }

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

type SearchParams = Record<string, string | string[] | undefined>;

interface Props {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;

  const categoryId = Number(slug);

  const { category } = await getCategoryPageData(categoryId);

  if (!category) {
    return notFound();
  }

  const { pageTitle, metaDescription, metaKeywords } = category.seo;

  return {
    title: pageTitle || category.name,
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
  };
}

export default async function Category(props: Props) {
  const { slug, locale } = await props.params;

  setRequestLocale(locale);

  const t = await getTranslations('Faceted');

  const categoryId = Number(slug);

  const { category, settings, categoryTree } = await getCategoryPageData(categoryId);

  if (!category) {
    return notFound();
  }

  const breadcrumbs = removeEdgesAndNodes(category.breadcrumbs).map(({ name, path }) => ({
    label: name,
    href: path ?? '#',
  }));

  const productComparisonsEnabled =
    settings?.storefront.catalog?.productComparisonsEnabled ?? false;

  // const createCategorySearchParamsCache = cache(async (props: Props) => {
  //   const { slug } = await props.params;
  //   const category = cacheCategoryFacetedSearch(slug);
  //   const categorySearch = await fetchFacetedSearch(category);
  //   const categoryFacets = categorySearch.facets.items.filter(
  //     (facet) => facet.__typename !== 'CategorySearchFilter',
  //   );
  //   const transformedCategoryFacets = await facetsTransformer({
  //     refinedFacets: categoryFacets,
  //     allFacets: categoryFacets,
  //     searchParams: {},
  //   });
  //   const categoryFilters = transformedCategoryFacets.filter((facet) => facet != null);
  //   const filterParsers = getFilterParsers(categoryFilters);

  //   // If there are no filters, return `null`, since calling `createSearchParamsCache` with an empty
  //   // object will throw the following cryptic error:
  //   //
  //   // ```
  //   // Error: [nuqs] Empty search params cache. Search params can't be accessed in Layouts.
  //   //   See https://err.47ng.com/NUQS-500
  //   // ```
  //   if (Object.keys(filterParsers).length === 0) {
  //     return null;
  //   }

  //   return createSearchParamsCache(filterParsers);
  // });

  const streamableFacetedSearch = Streamable.from(async () => {
    const searchParams = await props.searchParams;
    const customerAccessToken = await getSessionCustomerAccessToken();
    const currencyCode = await getPreferredCurrencyCode();

    // const searchParamsCache = await createCategorySearchParamsCache(props);
    // const parsedSearchParams = searchParamsCache?.parse(searchParams) ?? {};

    const search = await fetchFacetedSearch(
      {
        ...searchParams,
        // ...parsedSearchParams,
        category: categoryId,
      },
      currencyCode,
      customerAccessToken,
    );

    return search;
  });

  const streamableProducts = Streamable.from(async () => {
    const format = await getFormatter();

    const search = await streamableFacetedSearch;
    const products = search.products.items;

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
  });

  const streamableTotalCount = Streamable.from(async () => {
    const search = await streamableFacetedSearch;

    return search.products.collectionInfo?.totalItems ?? 0;
  });

  const streamablePagination = Streamable.from(async () => {
    const search = await streamableFacetedSearch;

    return pageInfoTransformer(search.products.pageInfo);
  });

  const streamableFilters = Streamable.from(async () => {
    const searchParams = await props.searchParams;
    // const parsedSearchParams = searchParamsCache?.parse(searchParams) ?? {};
    const search = await streamableFacetedSearch;

    const allFacets = search.facets.items.filter(
      (facet) => facet.__typename !== 'CategorySearchFilter',
    );
    const refinedFacets = search.facets.items.filter(
      (facet) => facet.__typename !== 'CategorySearchFilter',
    );

    const transformedFacets = await facetsTransformer({
      refinedFacets,
      allFacets,
      // searchParams: { ...searchParams, ...parsedSearchParams },
      searchParams,
    });

    const filters = transformedFacets.filter((facet) => facet != null);

    const tree = categoryTree[0];
    const subCategoriesFilters =
      tree == null || tree.children.length === 0
        ? []
        : [
            {
              type: 'link-group' as const,
              label: t('Category.subCategories'),
              links: tree.children.map((child) => ({
                label: child.name,
                href: child.path,
              })),
            },
          ];

    return [...subCategoriesFilters, ...filters];
  });

  return (
    <>
      <ProductsListSection
        breadcrumbs={breadcrumbs}
        compareLabel={t('Compare.compare')}
        compareProducts={Streamable.from(() => getCompareProducts(props))}
        emptyStateSubtitle={t('Category.Empty.subtitle')}
        emptyStateTitle={t('Category.Empty.title')}
        filterLabel={t('FacetedSearch.filters')}
        filters={streamableFilters}
        filtersPanelTitle={t('FacetedSearch.filters')}
        maxCompareLimitMessage={t('Compare.maxCompareLimit')}
        maxItems={MAX_COMPARE_LIMIT}
        paginationInfo={streamablePagination}
        products={streamableProducts}
        rangeFilterApplyLabel={t('FacetedSearch.Range.apply')}
        removeLabel={t('Compare.remove')}
        resetFiltersLabel={t('FacetedSearch.resetFilters')}
        showCompare={productComparisonsEnabled}
        sortDefaultValue="featured"
        sortLabel={t('SortBy.sortBy')}
        sortOptions={[
          { value: 'featured', label: t('SortBy.featuredItems') },
          { value: 'newest', label: t('SortBy.newestItems') },
          { value: 'best_selling', label: t('SortBy.bestSellingItems') },
          { value: 'a_to_z', label: t('SortBy.aToZ') },
          { value: 'z_to_a', label: t('SortBy.zToA') },
          { value: 'best_reviewed', label: t('SortBy.byReview') },
          { value: 'lowest_price', label: t('SortBy.priceAscending') },
          { value: 'highest_price', label: t('SortBy.priceDescending') },
          { value: 'relevance', label: t('SortBy.relevance') },
        ]}
        sortParamName="sort"
        title={category.name}
        totalCount={streamableTotalCount}
      />
      {/* <Stream
        value={Streamable.all([
          Streamable.from(() => getCategory(props)),
          Streamable.from(() => getProducts(props)),
        ])}
      >
        {([category, products]) => (
          <CategoryViewed category={category} categoryId={category.entityId} products={products} />
        )}
      </Stream> */}
    </>
  );
}
