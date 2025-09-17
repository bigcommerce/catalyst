import { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { createLoader, SearchParams } from 'nuqs/server';
import { cache } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { createCompareLoader } from '@/vibes/soul/primitives/compare-drawer/loader';
import { ProductsListSection } from '@/vibes/soul/sections/products-list-section';
import { getFilterParsers } from '@/vibes/soul/sections/products-list-section/filter-parsers';
import { getSessionCustomerAccessToken } from '~/auth';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { pageInfoTransformer } from '~/data-transformers/page-info-transformer';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';

import { MAX_COMPARE_LIMIT } from '../../compare/page-data';
import { getCompareProducts as getCompareProductsData } from '../fetch-compare-products';
import { fetchFacetedSearch } from '../fetch-faceted-search';

import { getSearchPageData } from './page-data';

const compareLoader = createCompareLoader();

const createSearchSearchParamsLoader = cache(
  async (searchParams: SearchParams, customerAccessToken?: string) => {
    const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : '';

    if (!searchTerm) {
      return null;
    }

    const search = await fetchFacetedSearch(searchParams, undefined, customerAccessToken);
    const searchFacets = search.facets.items;
    const transformedSearchFacets = await facetsTransformer({
      refinedFacets: searchFacets,
      allFacets: searchFacets,
      searchParams: {},
    });
    const searchFilters = transformedSearchFacets.filter((facet) => facet != null);
    const filterParsers = getFilterParsers(searchFilters);

    // If there are no filters, return `null`, since calling `createLoader` with an empty
    // object will throw the following cryptic error:
    //
    // ```
    // Error: [nuqs] Empty search params cache. Search params can't be accessed in Layouts.
    //   See https://err.47ng.com/NUQS-500
    // ```
    if (Object.keys(filterParsers).length === 0) {
      return null;
    }

    return createLoader(filterParsers);
  },
);

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Faceted.Search' });

  return {
    title: t('title'),
  };
}

export default async function Search(props: Props) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  const t = await getTranslations('Faceted');

  const { settings } = await getSearchPageData();

  const productComparisonsEnabled =
    settings?.storefront.catalog?.productComparisonsEnabled ?? false;

  const streamableFacetedSearch = Streamable.from(async () => {
    const searchParams = await props.searchParams;
    const customerAccessToken = await getSessionCustomerAccessToken();
    const currencyCode = await getPreferredCurrencyCode();

    const loadSearchParams = await createSearchSearchParamsLoader(
      searchParams,
      customerAccessToken,
    );
    const parsedSearchParams = loadSearchParams?.(searchParams) ?? {};

    const search = await fetchFacetedSearch(
      {
        ...searchParams,
        ...parsedSearchParams,
      },
      currencyCode,
      customerAccessToken,
    );

    return search;
  });

  const streamableProducts = Streamable.from(async () => {
    const format = await getFormatter();

    const searchParams = await props.searchParams;
    const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : '';

    if (!searchTerm) {
      return [];
    }

    const search = await streamableFacetedSearch;
    const products = search.products.items;

    return products.map((product) => ({
      id: product.entityId.toString(),
      title: product.name,
      href: product.path,
      image: product.defaultImage
        ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
        : undefined,
      price: pricesTransformer(
        {
          pricesIncTax: product.pricesIncTax,
          pricesExcTax: product.pricesExcTax,
        },
        settings?.tax?.plp,
        format,
      ),
      subtitle: product.brand?.name ?? undefined,
    }));
  });

  const streamableTitle = Streamable.from(async () => {
    const searchParams = await props.searchParams;
    const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : '';

    return `${t('Search.searchResults')} "${searchTerm}"`;
  });

  const streamableTotalCount = Streamable.from(async () => {
    const format = await getFormatter();
    const searchParams = await props.searchParams;
    const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : '';

    if (!searchTerm) {
      return format.number(0);
    }

    const search = await streamableFacetedSearch;

    return format.number(search.products.collectionInfo?.totalItems ?? 0);
  });

  const streamableEmptyStateTitle = Streamable.from(async () => {
    const searchParams = await props.searchParams;
    const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : '';

    return t('Search.Empty.title', { term: searchTerm });
  });

  const streamablePagination = Streamable.from(async () => {
    const searchParams = await props.searchParams;
    const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : '';

    if (!searchTerm) {
      return {
        startCursorParamName: 'before',
        endCursorParamName: 'after',
        endCursor: null,
        startCursor: null,
      };
    }

    const search = await streamableFacetedSearch;

    return pageInfoTransformer(search.products.pageInfo);
  });

  const streamableFilters = Streamable.from(async () => {
    const searchParams = await props.searchParams;
    const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : '';
    const customerAccessToken = await getSessionCustomerAccessToken();

    if (!searchTerm) {
      return [];
    }

    const loadSearchParams = await createSearchSearchParamsLoader(
      searchParams,
      customerAccessToken,
    );
    const parsedSearchParams = loadSearchParams?.(searchParams) ?? {};
    const categorySearch = await fetchFacetedSearch({}, undefined, customerAccessToken);
    const refinedSearch = await streamableFacetedSearch;

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
  });

  const streamableCompareProducts = Streamable.from(async () => {
    const searchParams = await props.searchParams;
    const customerAccessToken = await getSessionCustomerAccessToken();

    if (!productComparisonsEnabled) {
      return [];
    }

    const { compare } = compareLoader(searchParams);

    const compareIds = { entityIds: compare ? compare.map((id: string) => Number(id)) : [] };

    const products = await getCompareProductsData(compareIds, customerAccessToken);

    return products.map((product) => ({
      id: product.entityId.toString(),
      title: product.name,
      image: product.defaultImage
        ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
        : undefined,
      href: product.path,
    }));
  });

  return (
    <ProductsListSection
      breadcrumbs={[
        { label: t('Search.Breadcrumbs.home'), href: '/' },
        { label: t('Search.Breadcrumbs.search'), href: `#` },
      ]}
      compareLabel={t('Compare.compare')}
      compareProducts={streamableCompareProducts}
      emptyStateSubtitle={t('Search.Empty.subtitle')}
      emptyStateTitle={streamableEmptyStateTitle}
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
      title={streamableTitle}
      totalCount={streamableTotalCount}
    />
  );
}
