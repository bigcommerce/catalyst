import { getCategoryTree } from '~/client/queries/get-category-tree';
import { ExistingResultType } from '~/client/util';
import { locales } from '~/i18n';

import CategoryPage from '../page';

export default CategoryPage;

type Categories = ExistingResultType<typeof getCategoryTree>;
type Category = Omit<Categories[number], 'children'> & { children?: Category[] };

const getEntityIdsOfChildren = (categories: Category[] = []): number[] =>
  categories.reduce<number[]>(
    (acc, category) => acc.concat(category.entityId, getEntityIdsOfChildren(category.children)),
    [],
  );

export async function generateStaticParams() {
  const categories = await getCategoryTree();

  const entityIds = getEntityIdsOfChildren(categories);

  return locales.map((locale) => {
    return entityIds.map((entityId) => ({
      locale,
      slug: entityId.toString(),
    }));
  });
}

export const dynamic = 'force-static';
export const revalidate = 600;
