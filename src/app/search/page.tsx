import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { getProductSearchResults } from '@client';

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

const SearchBlock = ({ term }: { term?: string }) => {
  return (
    <div className="py-10">
      <form action="/search" method="get">
        <input
          className="grey-200 mr-4 border-2 px-8 py-3 font-semibold"
          defaultValue={term}
          name="term"
        />
        <button
          className="border-2 border-blue-primary px-8 py-3 font-semibold text-blue-primary"
          type="submit"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default async function Search({ searchParams }: Props) {
  const before = typeof searchParams.before === 'string' ? searchParams.before : undefined;
  const after = typeof searchParams.after === 'string' ? searchParams.after : undefined;
  const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : undefined;

  if (!searchTerm) {
    return (
      <>
        <h1 className="mb-3 text-h2">Search</h1>
        <SearchBlock />
      </>
    );
  }

  const productSearchResults = await getProductSearchResults({
    searchTerm,
    limit: 4,
    after,
    before,
  });

  if (productSearchResults.products.items.length === 0) {
    return (
      <div>
        <h1 className="mb-3 text-h2">Search</h1>

        <SearchBlock term={searchTerm} />

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

      <SearchBlock term={searchTerm} />

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
              <div className="group relative flex flex-col overflow-hidden" key={product.entityId}>
                <div className="group-hover:opacity-75">
                  <Image
                    alt={product.defaultImage?.altText ?? product.name}
                    className="h-full w-full object-cover object-center sm:h-full sm:w-full"
                    height={300}
                    src={product.defaultImage?.url ?? ''}
                    width={300}
                  />
                </div>

                <div className="flex flex-1 flex-col space-y-2 p-4">
                  {product.brand && <p className="text-base text-gray-500">{product.brand.name}</p>}

                  <h3 className="text-h5">
                    <Link href={`/product/${product.entityId}`}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.name}
                    </Link>
                  </h3>

                  <div className="flex flex-1 flex-col justify-end">
                    <p className="text-base">${product.prices?.price.value}</p>
                  </div>
                </div>
              </div>
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
