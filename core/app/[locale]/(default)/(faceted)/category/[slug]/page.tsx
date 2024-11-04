import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { ProductsListSection } from '@/vibes/soul/sections/products-list-section';
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
  setRequestLocale(locale);

  const categoryId = Number(slug);

  const t = await getTranslations('FacetedGroup.SortBy');
  const format = await getFormatter();

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
    title: product.name,
    href: product.path,
    image: product.defaultImage
      ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
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

  // TODO: remove hasNextPage and hasPreviousPage from query
  const { endCursor, startCursor } = productsCollection.pageInfo;

  const facets = search.facets.items.filter((facet) => facet.__typename !== 'CategorySearchFilter');
  const filters = await facetsTransformer(facets);

  // const selectedSort = searchParams.sort ?? 'featured';

  return (
    <ProductsListSection
      breadcrumbs={breadcrumbs}
      compareLabel={t('compare')}
      compareParamName="compare"
      filterLabel={t('filterBy')}
      filters={filters}
      paginationInfo={{
        startCursorParamName: 'before',
        endCursorParamName: 'after',
        endCursor: endCursor ?? undefined,
        startCursor: startCursor ?? undefined,
      }}
      products={products}
      sortLabel={t('sortBy')}
      sortOptions={[
        { value: 'featured', label: t('featuredItems') },
        { value: 'newest', label: t('newestItems') },
        {
          value: 'best_selling',
          label: t('bestSellingItems'),
        },
        { value: 'a_to_z', label: t('aToZ') },
        { value: 'z_to_a', label: t('zToA') },
        {
          value: 'best_reviewed',
          label: t('byReview'),
        },
        {
          value: 'lowest_price',
          label: t('priceAscending'),
        },
        {
          value: 'highest_price',
          label: t('priceDescending'),
        },
        { value: 'relevance', label: t('relevance') },
      ]}
      sortParamName="sort"
      title={category.name}
      totalCount={totalProducts}
    />
  );
}

export const runtime = 'edge';
