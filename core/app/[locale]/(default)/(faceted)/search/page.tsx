import { getTranslations } from 'next-intl/server';

import { ProductCard } from '~/components/product-card';
import { SearchForm } from '~/components/search-form';
import { Pagination } from '~/components/ui/pagination';

import { FacetedSearch } from '../_components/faceted-search';
import { MobileSideNav } from '../_components/mobile-side-nav';
import { SortBy } from '../_components/sort-by';
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

  const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : undefined;

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
  const products = productsCollection.items;

  if (products.length === 0) {
    return (
      <div>
        <SearchForm initialTerm={searchTerm} />
      </div>
    );
  }

  const { hasNextPage, hasPreviousPage, endCursor, startCursor } = productsCollection.pageInfo;

  return (
    <div className="group">
      <div className="md:mb-8 lg:flex lg:flex-row lg:items-center lg:justify-between">
        <h1 className="mb-3 text-base">
          {t('searchResults')} <br />
          <b className="text-2xl font-bold lg:text-3xl">"{searchTerm}"</b>
        </h1>

        <div className="flex flex-col items-center gap-3 whitespace-nowrap md:flex-row">
          <MobileSideNav>
            <FacetedSearch
              facets={search.facets.items}
              headingId="mobile-filter-heading"
              pageType="search"
            />
          </MobileSideNav>
          <div className="flex w-full flex-col items-start gap-4 md:flex-row md:items-center md:justify-end md:gap-6">
            <SortBy />
            <div className="order-3 py-4 text-base font-semibold md:order-2 md:py-0">
              {t('sortBy', { items: productsCollection.collectionInfo?.totalItems ?? 0 })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-8">
        <FacetedSearch
          className="mb-8 hidden lg:block"
          facets={search.facets.items}
          headingId="desktop-filter-heading"
          pageType="search"
        />
        <section
          aria-labelledby="product-heading"
          className="col-span-4 group-has-[[data-pending]]:animate-pulse lg:col-span-3"
        >
          <h2 className="sr-only" id="product-heading">
            {t('products')}
          </h2>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8">
            {products.map((product, index) => (
              <ProductCard
                imagePriority={index <= 3}
                imageSize="wide"
                key={product.entityId}
                product={product}
              />
            ))}
          </div>

          <Pagination
            endCursor={endCursor ?? undefined}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            startCursor={startCursor ?? undefined}
          />
        </section>
      </div>
    </div>
  );
}

export const runtime = 'edge';
