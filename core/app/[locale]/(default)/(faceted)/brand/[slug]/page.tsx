import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { CompareProducts } from '@/vibes/soul/components/compare-products';
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
  unstable_setRequestLocale(locale);

  const t = await getTranslations('FacetedGroup.SortBy');
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
    name: product.name,
    href: product.path,
    image: product.defaultImage
      ? { src: product.defaultImage.url, altText: product.defaultImage.altText }
      : undefined,
    price: pricesTransformer(product.prices, format),
    subtitle: product.brand?.name ?? undefined,
  }));

  const totalProducts = productsCollection.collectionInfo?.totalItems ?? 0;

  const { hasNextPage, hasPreviousPage, endCursor, startCursor } = productsCollection.pageInfo;

  const facets = search.facets.items.filter((facet) => facet.__typename !== 'BrandSearchFilter');
  const filters = await facetsTransformer(facets);

  const selectedSort = searchParams.sort ?? 'featured';

  return (
    <CompareProducts
      breadcrumbs={[]}
      filters={filters}
      pagination={{
        endCursor: endCursor ?? undefined,
        hasNextPage,
        hasPreviousPage,
        startCursor: startCursor ?? undefined,
      }}
      products={products}
      sort={[
        { value: 'featured', label: t('featuredItems'), selected: selectedSort === 'featured' },
        { value: 'newest', label: t('newestItems'), selected: selectedSort === 'newest' },
        {
          value: 'best_selling',
          label: t('bestSellingItems'),
          selected: selectedSort === 'best_selling',
        },
        { value: 'a_to_z', label: t('aToZ'), selected: selectedSort === 'a_to_z' },
        { value: 'z_to_a', label: t('zToA'), selected: selectedSort === 'z_to_a' },
        {
          value: 'best_reviewed',
          label: t('byReview'),
          selected: selectedSort === 'best_reviewed',
        },
        {
          value: 'lowest_price',
          label: t('priceAscending'),
          selected: selectedSort === 'lowest_price',
        },
        {
          value: 'highest_price',
          label: t('priceDescending'),
          selected: selectedSort === 'highest_price',
        },
        { value: 'relevance', label: t('relevance'), selected: selectedSort === 'relevance' },
      ]}
      title={brand.name}
      totalProducts={totalProducts}
    />
  );
}

export const runtime = 'edge';
