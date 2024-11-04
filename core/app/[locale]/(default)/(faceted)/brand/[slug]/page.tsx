import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { ProductsListSection } from '@/vibes/soul/sections/products-list-section';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { LocaleType } from '~/i18n/routing';

import { fetchFacetedSearch } from '../../fetch-faceted-search';

import { getBrand } from './page-data';

interface Props {
  params: {
    slug: string;
    locale: LocaleType;
  };
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brandId = Number(params.slug);

  const brand = await getBrand({ entityId: brandId });

  if (!brand) {
    return {};
  }

  const { pageTitle, metaDescription, metaKeywords } = brand.seo;

  return {
    title: pageTitle || brand.name,
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
  };
}

export default async function Brand({ params: { slug, locale }, searchParams }: Props) {
  setRequestLocale(locale);

  const t = await getTranslations('FacetedGroup');

  const format = await getFormatter();

  const brandId = Number(slug);

  const [brand, search] = await Promise.all([
    getBrand({ entityId: brandId }),
    fetchFacetedSearch({ ...searchParams, brand: [slug] }),
  ]);

  if (!brand) {
    notFound();
  }

  const productsCollection = search.products;
  const products = productsCollection.items.map((product) => ({
    id: product.entityId.toString(),
    title: product.name,
    href: product.path,
    image: product.defaultImage
      ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
      : undefined,
    price: pricesTransformer(product.prices, format),
    subtitle: product.brand?.name ?? undefined,
  }));

  const totalProducts = productsCollection.collectionInfo?.totalItems ?? 0;

  // TODO: remove hasNextPage and hasPreviousPage from query
  const { endCursor, startCursor } = productsCollection.pageInfo;

  const facets = search.facets.items.filter((facet) => facet.__typename !== 'BrandSearchFilter');
  const filters = await facetsTransformer(facets);

  return (
    <ProductsListSection
      compareLabel={t('compare')}
      compareParamName="compare"
      filterLabel={t('FacetedSearch.filterBy')}
      filters={filters}
      paginationInfo={{
        startCursorParamName: 'before',
        endCursorParamName: 'after',
        endCursor: endCursor ?? undefined,
        startCursor: startCursor ?? undefined,
      }}
      products={products}
      sortLabel={t('SortBy.ariaLabel')}
      sortOptions={[
        { value: 'featured', label: t('SortBy.featuredItems') },
        { value: 'newest', label: t('SortBy.newestItems') },
        {
          value: 'best_selling',
          label: t('SortBy.bestSellingItems'),
        },
        { value: 'a_to_z', label: t('SortBy.aToZ') },
        { value: 'z_to_a', label: t('SortBy.zToA') },
        {
          value: 'best_reviewed',
          label: t('SortBy.byReview'),
        },
        {
          value: 'lowest_price',
          label: t('SortBy.priceAscending'),
        },
        {
          value: 'highest_price',
          label: t('SortBy.priceDescending'),
        },
        { value: 'relevance', label: t('SortBy.relevance') },
      ]}
      sortParamName="sort"
      title={brand.name}
      totalCount={totalProducts}
    />
  );
}

export const runtime = 'edge';
