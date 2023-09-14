import Link from 'next/link';

import client from '~/client';

interface Props {
  categoryId: number;
}

export async function SubCategories({ categoryId }: Props) {
  const [categoryTree] = await client.getCategoryTree(categoryId);

  if (!categoryTree?.children.length) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="mb-3 text-h5">Categories</h3>

      <ul className="flex flex-col gap-4 text-base">
        {categoryTree.children.map((category) => (
          <li key={category.entityId}>
            <Link href={`/category/${category.entityId}`}>{category.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
