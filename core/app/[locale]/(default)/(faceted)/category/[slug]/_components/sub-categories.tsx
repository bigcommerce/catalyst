import { useTranslations } from 'next-intl';

import { FragmentOf, graphql } from '~/client/graphql';
import { Link } from '~/components/link';

export const CategoryTreeFragment = graphql(`
  fragment CategoryTreeFragment on Site {
    categoryTree(rootEntityId: $categoryId) {
      entityId
      name
      path
      children {
        entityId
        name
        path
        children {
          entityId
          name
          path
        }
      }
    }
  }
`);

type FragmentResult = FragmentOf<typeof CategoryTreeFragment>;
type CategoryTree = FragmentResult['categoryTree'];

interface Props {
  categoryTree: CategoryTree;
}

export function SubCategories({ categoryTree }: Props) {
  const t = useTranslations('FacetedGroup.MobileSideNav');

  if (!categoryTree[0]?.children?.length) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="mb-3 text-2xl font-bold">{t('subCategories')}</h3>

      <ul className="flex flex-col gap-4">
        {categoryTree[0].children.map((category) => (
          <li key={category.entityId}>
            <Link href={category.path}>{category.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
