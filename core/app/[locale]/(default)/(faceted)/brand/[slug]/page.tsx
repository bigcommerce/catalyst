import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getLocale, getTranslations } from 'next-intl/server';
import { createLoader, SearchParams } from 'nuqs/server';
import { cache } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { createCompareLoader } from '@/vibes/soul/primitives/compare-drawer/loader';
import { ProductsListSection } from '@/vibes/soul/sections/products-list-section';
import { getFilterParsers } from '@/vibes/soul/sections/products-list-section/filter-parsers';
import { getSessionCustomerAccessToken } from '~/auth';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { pageInfoTransformer } from '~/data-transformers/page-info-transformer';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { MAX_COMPARE_LIMIT } from '../../../compare/page-data';
import { getCompareProducts as getCompareProductsData } from '../../fetch-compare-products';
import { fetchFacetedSearch } from '../../fetch-faceted-search';

import { getBrandPageData } from './page-data';

const getCachedBrand = cache((brandId: string) => {
  return {
    brand: [brandId],
  };
});

const compareLoader = createCompareLoader();

const createBrandSearchParamsLoader = cache(
  async (locale: string, brandId: string, customerAccessToken?: string) => {
    const cachedBrand = getCachedBrand(brandId);
    const brandSearch = await fetchFacetedSearch(
      locale,
      cachedBrand,
      undefined,
      customerAccessToken,
    );
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
  params: Promise<{
    slug: string;
    locale: string;
  }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const [{ slug, locale }, customerAccessToken] = await Promise.all([
    props.params,
    getSessionCustomerAccessToken(),
  ]);

  const brandId = Number(slug);

  const { brand } = await getBrandPageData(locale, brandId, customerAccessToken);

  if (!brand) {
    return notFound();
  }

  const { pageTitle, metaDescription, metaKeywords } = brand.seo;

  return {
    title: pageTitle || brand.name,
    ...(metaDescription && { description: metaDescription }),
    ...(metaKeywords && { keywords: metaKeywords.split(',') }),
    ...(brand.path && { alternates: await getMetadataAlternates({ path: brand.path, locale }) }),
  };
}

export default async function Brand({ params, searchParams }: Props) {
  const locale = await getLocale();
  const t = await getTranslations('Faceted');

  // Cached (guest) brand data for the static shell — always uses the cached path
  // so title, settings, showRating resolve instantly from 'use cache' during PPR.
  const streamableCachedBrandData = Streamable.from(async () => {
    const { slug } = await params;

    return getBrandPageData(locale, Number(slug));
  });

  const streamableTitle = Streamable.from(async () => {
    const { brand } = await streamableCachedBrandData;

    if (!brand) {
      return notFound();
    }

    return brand.name;
  });

  const streamableShowRating = Streamable.from(async () => {
    const { settings } = await streamableCachedBrandData;

    return Boolean(settings?.reviews.enabled && settings.display.showProductRating);
  });

  const streamableShowCompare = Streamable.from(async () => {
    const { settings } = await streamableCachedBrandData;

    return settings?.storefront.catalog?.productComparisonsEnabled ?? false;
  });

  const streamableFacetedSearch = Streamable.from(async () => {
    const { slug } = await params;
    const searchParamsResolved = await searchParams;
    const [customerAccessToken, currencyCode] = await Promise.all([
      getSessionCustomerAccessToken(),
      getPreferredCurrencyCode(),
    ]);

    const loadSearchParams = await createBrandSearchParamsLoader(locale, slug, customerAccessToken);
    const parsedSearchParams = loadSearchParams?.(searchParamsResolved) ?? {};

    const search = await fetchFacetedSearch(
      locale,
      {
        ...searchParamsResolved,
        ...parsedSearchParams,
        brand: [slug],
      },
      currencyCode,
      customerAccessToken,
    );

    return search;
  });

  const streamableProducts = Streamable.from(async () => {
    const [format, { settings }] = await Promise.all([getFormatter(), streamableCachedBrandData]);

    const search = await streamableFacetedSearch;
    const products = search.products.items;

    const { defaultOutOfStockMessage, showOutOfStockMessage, showBackorderMessage } =
      settings?.inventory ?? {};

    return productCardTransformer(
      products,
      format,
      showOutOfStockMessage ? defaultOutOfStockMessage : undefined,
      showBackorderMessage,
    );
  });

  const streamableTotalCount = Streamable.from(async () => {
    const format = await getFormatter();
    const search = await streamableFacetedSearch;

    return format.number(search.products.collectionInfo?.totalItems ?? 0);
  });

  const streamablePagination = Streamable.from(async () => {
    const search = await streamableFacetedSearch;

    return pageInfoTransformer(search.products.pageInfo);
  });

  const streamableFilters = Streamable.from(async () => {
    const { slug } = await params;
    const searchParamsResolved = await searchParams;
    const customerAccessToken = await getSessionCustomerAccessToken();

    const loadSearchParams = await createBrandSearchParamsLoader(locale, slug, customerAccessToken);
    const parsedSearchParams = loadSearchParams?.(searchParamsResolved) ?? {};
    const cachedBrand = getCachedBrand(slug);
    const categorySearch = await fetchFacetedSearch(
      locale,
      cachedBrand,
      undefined,
      customerAccessToken,
    );
    const refinedSearch = await streamableFacetedSearch;

    const allFacets = categorySearch.facets.items.filter(
      (facet) => facet.__typename !== 'BrandSearchFilter',
    );
    const refinedFacets = refinedSearch.facets.items.filter(
      (facet) => facet.__typename !== 'BrandSearchFilter',
    );

    const transformedFacets = await facetsTransformer({
      refinedFacets,
      allFacets,
      searchParams: { ...searchParamsResolved, ...parsedSearchParams },
    });

    return transformedFacets.filter((facet) => facet != null);
  });

  const streamableCompareProducts = Streamable.from(async () => {
    const searchParamsResolved = await searchParams;
    const showCompare = await streamableShowCompare;

    if (!showCompare) {
      return [];
    }

    const customerAccessToken = await getSessionCustomerAccessToken();
    const { compare } = compareLoader(searchParamsResolved);

    const compareIds = { entityIds: compare ? compare.map((id: string) => Number(id)) : [] };

    const products = await getCompareProductsData(locale, compareIds, customerAccessToken);

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
      compareLabel={t('Compare.compare')}
      compareProducts={streamableCompareProducts}
      emptyStateSubtitle={t('Brand.Empty.subtitle')}
      emptyStateTitle={t('Brand.Empty.title')}
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
      showCompare={streamableShowCompare}
      showRating={streamableShowRating}
      sortDefaultValue="featured"
      sortLabel={t('Search.title')}
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
