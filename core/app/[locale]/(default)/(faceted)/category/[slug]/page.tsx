import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { mapStreamable } from '@/vibes/soul/lib/streamable/server';
import { ProductsListSection } from '@/vibes/soul/sections/products-list-section';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { LocaleType } from '~/i18n/routing';

import { redirectToCompare } from '../../_actions/redirect-to-compare';
import { fetchFacetedSearch } from '../../fetch-faceted-search';

import { CategoryViewed } from './_components/category-viewed';
import { getCategoryPageData, getCompareProducts } from './page-data';

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

  const t = await getTranslations('FacetedGroup');

  const format = await getFormatter();

  const { category } = await getCategoryPageData({ categoryId });

  if (!category) {
    return notFound();
  }

  const searchPromise = fetchFacetedSearch({ ...searchParams, category: categoryId });

  const productsCollectionPromise = searchPromise.then((search) => search.products);
  const productsPromise = productsCollectionPromise.then((productsCollection) =>
    productsCollection.items.map((product) => ({
      id: product.entityId.toString(),
      title: product.name,
      href: product.path,
      image: product.defaultImage
        ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
        : undefined,
      price: pricesTransformer(product.prices, format),
      subtitle: product.brand?.name ?? undefined,
    })),
  );

  const totalProducts = productsCollectionPromise.then(
    (productsCollection) => productsCollection.collectionInfo?.totalItems ?? 0,
  );

  const breadcrumbs = removeEdgesAndNodes(category.breadcrumbs).map(({ name, path }) => ({
    label: name,
    href: path ?? '#',
  }));

  // TODO: add subcategories to Category page
  // const subcategories = categoryTree;

  // TODO: remove hasNextPage and hasPreviousPage from query
  const pageInfoPromise = productsCollectionPromise.then(
    (productsCollection) => productsCollection.pageInfo,
  );

  const facetsPromise = searchPromise.then((search) =>
    search.facets.items.filter((facet) => facet.__typename !== 'CategorySearchFilter'),
  );
  const filtersPromise = facetsPromise.then((facets) => facetsTransformer(facets));

  const compare = searchParams.compare;

  const compareProducts =
    typeof compare === 'string'
      ? getCompareProducts({ entityIds: compare.split(',').map((id) => Number(id)) }).then((data) =>
          removeEdgesAndNodes(data.products).map((product) => ({
            id: product.entityId.toString(),
            title: product.name,
            href: product.path,
            image: product.defaultImage
              ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
              : undefined,
          })),
        )
      : [];

  return (
    <>
      <ProductsListSection
        breadcrumbs={breadcrumbs}
        compareAction={redirectToCompare}
        compareLabel={t('compare')}
        compareParamName="compare"
        compareProducts={compareProducts}
        filterLabel={t('FacetedSearch.filters')}
        filters={filtersPromise.then((filters) => filters.filter((filter) => !!filter))}
        paginationInfo={pageInfoPromise.then(
          ({ hasNextPage, hasPreviousPage, endCursor, startCursor }) =>
            hasNextPage || hasPreviousPage
              ? {
                  startCursorParamName: 'before',
                  endCursorParamName: 'after',
                  endCursor: hasNextPage ? endCursor : null,
                  startCursor: hasPreviousPage ? startCursor : null,
                }
              : null,
        )}
        products={productsPromise.then(async (products) => {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          return products;
        })}
        sortLabel={t('SortBy.label')}
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
        title={category.name}
        totalCount={totalProducts}
      />
      {mapStreamable(searchPromise, (search) => (
        <CategoryViewed
          category={category}
          categoryId={categoryId}
          products={search.products.items}
        />
      ))}
    </>
  );
}

export const runtime = 'edge';
