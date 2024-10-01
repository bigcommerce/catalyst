import { getFormatter, getTranslations } from 'next-intl/server';

import { CompareProducts } from '@/vibes/soul/components/compare-products';
import { SearchForm } from '~/components/search-form';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

import { fetchFacetedSearch } from '../../fetch-faceted-search';

export const ProductList = async ({
  searchTerm,
  searchParams,
}: {
  searchTerm: string;
  searchParams: Record<string, string | string[] | undefined>;
}) => {
  const t = await getTranslations('FacetedGroup.SortBy');
  const format = await getFormatter();

  const search = await fetchFacetedSearch({ ...searchParams });

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

  if (products.length === 0) {
    return (
      <div>
        <SearchForm initialTerm={searchTerm} />
      </div>
    );
  }

  const totalProducts = productsCollection.collectionInfo?.totalItems ?? 0;

  const { hasNextPage, hasPreviousPage, endCursor, startCursor } = productsCollection.pageInfo;

  const facets = search.facets.items.filter((facet) => facet.__typename !== 'CategorySearchFilter');
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
      title={searchTerm}
      totalProducts={totalProducts}
    />
  );
};
