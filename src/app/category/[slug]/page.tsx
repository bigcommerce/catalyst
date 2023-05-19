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
    limit: 2,
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
      <h1 className="mb-3 text-[50px] font-black leading-[66px] text-black">{category.name}</h1>

      <ul>
        {products.map((product) => (
          <li key={product.entityId}>
            <Link href={`/product/${product.entityId}`}>{product.name}</Link>
          </li>
        ))}
      </ul>

      <div>
        {hasPreviousPage && (
          <Link href={`/category/${categoryId}?before=${String(startCursor)}`}>Previous</Link>
        )}
        {hasNextPage && (
          <Link href={`/category/${categoryId}?after=${String(endCursor)}`}>Next</Link>
        )}
      </div>
    </div>
  );
}

export const runtime = 'experimental-edge';
