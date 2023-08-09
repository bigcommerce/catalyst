import { Button } from '@bigcommerce/reactant/Button';
import { Select, SelectContent, SelectItem } from '@bigcommerce/reactant/Select';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ProductCard } from 'src/app/components/ProductCard';
import client from '~/client';

import { Breadcrumbs } from './Breadcrumbs';
import { fetchCategory, PublicSearchParamsSchema } from './fetchCategory';

interface Props {
  params: {
    slug: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Category({ params, searchParams }: Props) {
  const categoryId = Number(params.slug);

  const parsedParams = PublicSearchParamsSchema.parse({ categoryId, ...searchParams });

  const search = await fetchCategory(parsedParams);

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

      <div className="lg:mb-8 lg:flex lg:flex-row lg:items-center lg:justify-between">
        <h1 className="mb-4 text-h2 lg:mb-0">{category.name}</h1>

        <div className="flex flex-col items-center gap-3 whitespace-nowrap md:flex-row">
          <Button className="items-center md:w-auto lg:hidden" variant="secondary">
            <Filter className="mr-3" /> <span>Show Filters</span>
          </Button>
          <div className="flex w-full flex-col items-start gap-4 md:flex-row md:items-center md:justify-end md:gap-6">
            <Select className="order-2 min-w-[224px] md:order-3 md:w-auto" defaultValue="featured">
              <SelectContent>
                <SelectItem value="featured">Featured items</SelectItem>
                <SelectItem value="newest">Newest items</SelectItem>
                <SelectItem value="best_selling">Best selling</SelectItem>
                <SelectItem value="a_to_z">A to Z</SelectItem>
                <SelectItem value="z_to_a">Z to A</SelectItem>
                <SelectItem value="best_reviewed">By review</SelectItem>
                <SelectItem value="lowest_price">Price: ascending</SelectItem>
                <SelectItem value="highest_price">Price: descending</SelectItem>
                <SelectItem value="relevance">Relevance</SelectItem>
              </SelectContent>
            </Select>
            <div className="order-3 py-4 text-base font-semibold md:order-2 md:py-0">
              {/* TODO: Plural vs. singular items */}
              {search.products.collectionInfo?.totalItems} items
            </div>
          </div>
        </div>
      </div>

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
