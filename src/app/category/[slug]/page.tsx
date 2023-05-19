import { notFound } from 'next/navigation';

import { getCategory } from '@client';

export default async function Category({ params }: { params: { slug: string } }) {
  const categoryId = Number(params.slug);
  const category = await getCategory({ categoryId });

  if (!category) {
    return notFound();
  }

  const products = category.products.items;

  return (
    <div>
      <h1 className="mb-3 text-[50px] font-black leading-[66px] text-black">{category.name}</h1>

      <ul>
        {products.map((product) => (
          <li key={product.entityId}>
            <a href={`/product/${product.entityId}`}>{product.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const runtime = 'experimental-edge';
