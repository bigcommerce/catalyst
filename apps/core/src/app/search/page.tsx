import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import client from '~/client';

import { ProductCard } from '../components/ProductCard';

import { SearchForm } from './SearchForm';

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Search({ searchParams }: Props) {
  const before = typeof searchParams.before === 'string' ? searchParams.before : undefined;
  const after = typeof searchParams.after === 'string' ? searchParams.after : undefined;
  const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : undefined;

  if (!searchTerm) {
    return (
      <>
        <h1 className="mb-3 text-h2">Search</h1>
        <SearchForm />
      </>
    );
  }

  const productSearchResults = await client.getProductSearchResults({
    searchTerm,
    limit: 4,
    after,
    before,
  });

  if (productSearchResults.products.items.length === 0) {
    return (
      <div>
        <h1 className="mb-3 text-h2">Search</h1>

        <SearchForm initialTerm={searchTerm} />

        <p className="pv-6">
          <em>No Results</em>
        </p>
      </div>
    );
  }

  const productsCollection = productSearchResults.products;
  const products = productsCollection.items;
  const { hasNextPage, hasPreviousPage, endCursor, startCursor } = productsCollection.pageInfo;

  return (
    <div>
      <h1 className="mb-3 text-h2">Search</h1>

      <SearchForm initialTerm={searchTerm} />

      <div className="pt-6 lg:grid lg:grid-cols-4 lg:gap-x-8">
        <section
          aria-labelledby="product-heading"
          className="mt-6 lg:col-span-2 lg:mt-0 xl:col-span-4"
        >
          <h2 className="sr-only" id="product-heading">
            Products
          </h2>

          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.entityId} product={product} />
            ))}
          </div>

          <nav aria-label="Pagination" className="my-6 text-center text-blue-primary">
            {hasPreviousPage ? (
              <Link href={`/search?term=${searchTerm}&before=${String(startCursor)}`}>
                <span className="sr-only">Previous</span>
                <ChevronLeft aria-hidden="true" className="inline-block h-8 w-8" />
              </Link>
            ) : (
              <ChevronLeft aria-hidden="true" className="inline-block h-8 w-8 text-gray-200" />
            )}

            {hasNextPage ? (
              <Link href={`/search?term=${searchTerm}&after=${String(endCursor)}`}>
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
