import { getTranslations } from 'next-intl/server';

import { getCategoryTree } from '~/client/queries/get-category-tree';
import { Link } from '~/components/link';

interface Props {
  categoryId: number;
}

export async function SubCategories({ categoryId }: Props) {
  const [categoryTree] = await getCategoryTree(categoryId);
  const t = await getTranslations('FacetedGroup.MobileSideNav');

  if (!categoryTree?.children.length) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="mb-3 text-2xl font-bold">{t('subCategories')}</h3>

      <ul className="flex flex-col gap-4">
        {categoryTree.children.map((category) => (
          <li key={category.entityId}>
            <Link href={category.path}>{category.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
