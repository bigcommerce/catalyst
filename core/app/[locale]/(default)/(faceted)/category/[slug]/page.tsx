import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { CompareProducts } from '@/vibes/soul/components/compare-products';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { LocaleType } from '~/i18n/routing';

import { fetchFacetedSearch } from '../../fetch-faceted-search';

import { getCategoryPageData } from './page-data';

interface Props {
  params: {
    slug: string;
    locale: LocaleType;
  };
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoryId = Number(params.slug);

  const data = await getCategoryPageData({
    categoryId,
  });

  const category = data.category;

  if (!category) {
    return {};
  }

  const { pageTitle, metaDescription, metaKeywords } = category.seo;

  return {
    title: pageTitle || category.name,
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
  };
}

export default async function Category({ params: { locale, slug }, searchParams }: Props) {
  unstable_setRequestLocale(locale);

  const t = await getTranslations('FacetedGroup.SortBy');
  const format = await getFormatter();

  const categoryId = Number(slug);

  const [{ category }, search] = await Promise.all([
    getCategoryPageData({ categoryId }),
    fetchFacetedSearch({ ...searchParams, category: categoryId }),
  ]);

  if (!category) {
    return notFound();
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

  const breadcrumbs = removeEdgesAndNodes(category.breadcrumbs).map(({ name, path }) => ({
    label: name,
    href: path ?? '#',
  }));

  // TODO: add subcategories to Category page
  // const subcategories = categoryTree;

  const { hasNextPage, hasPreviousPage, endCursor, startCursor } = productsCollection.pageInfo;

  const facets = search.facets.items.filter((facet) => facet.__typename !== 'CategorySearchFilter');
  const filters = await facetsTransformer(facets);

  const selectedSort = searchParams.sort ?? 'featured';

  return (
    <CompareProducts
      breadcrumbs={breadcrumbs}
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
      title={category.name}
      totalProducts={totalProducts}
    />
  );
}

export const runtime = 'edge';
