import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getCategory } from '@client';

interface Props {
  params: {
    slug: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Category({ params, searchParams }: Props) {
  const before = typeof searchParams.before === 'string' ? searchParams.before : undefined;
  const after = typeof searchParams.after === 'string' ? searchParams.after : undefined;

  const categoryId = Number(params.slug);
  const category = await getCategory({
    categoryId,
    limit: 4,
    after,
    before,
  });

  if (!category) {
    return notFound();
  }

  const productsCollection = category.products;
  const products = productsCollection.items;
  const { hasNextPage, hasPreviousPage, endCursor, startCursor } = productsCollection.pageInfo;

  return (
    <div>
      <h1 className="mb-3 text-h2">{category.name}</h1>

      <div className="pt-6 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
        <section aria-labelledby="filters-heading" className="flex flex-col gap-6">
          <h2 className="sr-only" id="filters-heading">
            Filters
          </h2>

          <div>
            <h3 className="mb-3 text-h5">Categories</h3>

            <ul className="flex flex-col gap-4 text-base">
              <li>Category 1</li>
              <li>Category 2</li>
              <li>Category 3</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-h5">Brand</h3>

            <ul className="flex flex-col gap-4 text-base">
              <li>Brand 1</li>
              <li>Brand 2</li>
              <li>Brand 3</li>
            </ul>
          </div>
        </section>

        <section
          aria-labelledby="product-heading"
          className="mt-6 lg:col-span-2 lg:mt-0 xl:col-span-3"
        >
          <h2 className="sr-only" id="product-heading">
            Products
          </h2>

          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8 xl:grid-cols-3">
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
