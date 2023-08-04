import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ProductCard } from 'src/app/components/ProductCard';
import client from '~/client';

import { Breadcrumbs } from './Breadcrumbs';
import { fetchCategory } from './fetchCategory';

interface Props {
  params: {
    slug: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Category({ params, searchParams }: Props) {
  const categoryId = Number(params.slug);

  // Eventually we'll want to have a utility parse the query params for the page and map them to the appropriate graphql filters.
  const after = typeof searchParams.after === 'string' ? searchParams.after : undefined;
  const before = typeof searchParams.before === 'string' ? searchParams.before : undefined;
  const limit = typeof searchParams.limit === 'string' ? Number(searchParams.limit) : undefined;

  const fetchCategoryParams = { categoryId, limit, after, before };

  const search = await fetchCategory(fetchCategoryParams);

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

      <h1 className="mb-3 text-h2">{category.name}</h1>

      <div className="pt-6 sm:grid sm:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
        <aside aria-labelledby="filters-heading" className="flex flex-col gap-6">
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
        </aside>

        <section
          aria-labelledby="product-heading"
          className="mt-6 sm:col-span-2 lg:mt-0 xl:col-span-3"
        >
          <h2 className="sr-only" id="product-heading">
            Products
          </h2>

          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.entityId} product={product} />
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
