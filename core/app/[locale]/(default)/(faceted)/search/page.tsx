import { getFormatter, getTranslations } from 'next-intl/server';

import { ProductsListSection } from '@/vibes/soul/sections/products-list-section';
import { SearchForm } from '~/components/search-form';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

import { fetchFacetedSearch } from '../fetch-faceted-search';

export async function generateMetadata() {
  const t = await getTranslations('Search');

  return {
    title: t('title'),
  };
}

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function Search({ searchParams }: Props) {
  const t = await getTranslations('Search');
  const f = await getTranslations('FacetedGroup');

  const format = await getFormatter();

  const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : undefined;

  // TODO: add Soul component
  if (!searchTerm) {
    return (
      <>
        <h1 className="mb-3 text-4xl font-black lg:text-5xl">{t('heading')}</h1>
        <SearchForm />
      </>
    );
  }

  const search = await fetchFacetedSearch({ ...searchParams });

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

  if (products.length === 0) {
    return (
      <div>
        <SearchForm initialTerm={searchTerm} />
      </div>
    );
  }

  const totalProducts = productsCollection.collectionInfo?.totalItems ?? 0;

  // TODO: remove hasNextPage and hasPreviousPage from query
  const { endCursor, startCursor } = productsCollection.pageInfo;

  const facets = search.facets.items;
  const filters = await facetsTransformer(facets);

  return (
    <ProductsListSection
      compareLabel={f('compare')}
      compareParamName="compare"
      filterLabel={f('FacetedSearch.filters')}
      filters={filters.filter((filter) => !!filter)}
      paginationInfo={{
        startCursorParamName: 'before',
        endCursorParamName: 'after',
        endCursor: endCursor ?? undefined,
        startCursor: startCursor ?? undefined,
      }}
      products={products}
      sortLabel={f('SortBy.label')}
      sortOptions={[
        { value: 'featured', label: f('SortBy.featuredItems') },
        { value: 'newest', label: f('SortBy.newestItems') },
        {
          value: 'best_selling',
          label: f('SortBy.bestSellingItems'),
        },
        { value: 'a_to_z', label: f('SortBy.aToZ') },
        { value: 'z_to_a', label: f('SortBy.zToA') },
        {
          value: 'best_reviewed',
          label: f('SortBy.byReview'),
        },
        {
          value: 'lowest_price',
          label: f('SortBy.priceAscending'),
        },
        {
          value: 'highest_price',
          label: f('SortBy.priceDescending'),
        },
        { value: 'relevance', label: f('SortBy.relevance') },
      ]}
      sortParamName="sort"
      title={`${t('searchResults')} "${searchTerm}"`}
      totalCount={totalProducts}
    />
  );
}

export const runtime = 'edge';
