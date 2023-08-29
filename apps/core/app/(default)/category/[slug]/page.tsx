import { Button } from '@bigcommerce/reactant/Button';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import client from '~/client';
import { ProductCard } from '~/components/ProductCard';

import { Breadcrumbs } from './_components/breadcrumbs';
import { FacetedSearch } from './_components/faceted-search';
import { SortBy } from './_components/sort-by';
import { fetchCategory } from './fetchCategory';

interface Props {
  params: {
    slug: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Category({ params, searchParams }: Props) {
  const categoryId = Number(params.slug);

  const search = await fetchCategory({ categoryId, ...searchParams });

  // We will only need a partial of this query to fetch the category name and breadcrumbs.
  // The rest of the arguments are useless at this point.
  const category = await client.getCategory({
    categoryId,
  });

  if (!category) {
    return notFound();
  }

  const productsCollection = search.products;
  const products = productsCollection.items;
  const { hasNextPage, hasPreviousPage, endCursor, startCursor } = productsCollection.pageInfo;

  return (
    <div>
      <Breadcrumbs breadcrumbs={category.breadcrumbs.items} category={category.name} />

      <div className="md:mb-8 lg:flex lg:flex-row lg:items-center lg:justify-between">
        <h1 className="mb-4 text-h2 lg:mb-0">{category.name}</h1>

        <div className="flex flex-col items-center gap-3 whitespace-nowrap md:flex-row">
          <Button className="items-center md:w-auto lg:hidden" variant="secondary">
            <Filter className="mr-3" /> <span>Show Filters</span>
          </Button>
          <div className="flex w-full flex-col items-start gap-4 md:flex-row md:items-center md:justify-end md:gap-6">
            <SortBy />
            <div className="order-3 py-4 text-base font-semibold md:order-2 md:py-0">
              {/* TODO: Plural vs. singular items */}
              {productsCollection.collectionInfo?.totalItems} items
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-8">
        <FacetedSearch
          categoryId={categoryId}
          className="hidden lg:block"
          facets={search.facets.items}
          headingId="desktop-filter-heading"
        />

        <section aria-labelledby="product-heading" className="col-span-4 lg:col-span-3">
          <h2 className="sr-only" id="product-heading">
            Products
          </h2>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8">
            {products.map((product) => (
              <ProductCard imageSize="wide" key={product.entityId} product={product} />
            ))}
          </div>

          <nav aria-label="Pagination" className="my-6 text-center text-blue-primary">
            {hasPreviousPage ? (
              <Link href={`/category/${categoryId}?before=${String(startCursor)}`}>
                <span className="sr-only">Previous</span>
                <ChevronLeft aria-hidden="true" className="inline-block h-8 w-8" />
              </Link>
            ) : (
              <ChevronLeft aria-hidden="true" className="inline-block h-8 w-8 text-gray-200" />
            )}

            {hasNextPage ? (
              <Link href={`/category/${categoryId}?after=${String(endCursor)}`}>
                <span className="sr-only">Next</span>
                <ChevronRight aria-hidden="true" className="inline-block h-8 w-8" />
              </Link>
            ) : (
              <ChevronRight aria-hidden="true" className="inline-block h-8 w-8 text-gray-200" />
            )}
          </nav>
        </section>
      </div>
    </div>
  );
}

export const runtime = 'edge';
