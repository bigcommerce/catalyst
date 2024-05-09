import { cache } from 'react';

import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate as revalidateTarget } from '~/client/revalidate-target';
import { ExistingResultType } from '~/client/util';
import { locales } from '~/i18n';

import { CategoryTreeFragment } from '../_components/sub-categories';
import CategoryPage from '../page';

export default CategoryPage;

const CategoryTreeQuery = graphql(
  `
    query CategoryTreeQuery($categoryId: Int) {
      site {
        ...CategoryTreeFragment
      }
    }
  `,
  [CategoryTreeFragment],
);

type CategoryTreeQueryVariables = VariablesOf<typeof CategoryTreeQuery>;

const getCategoryTree = cache(async (variables: CategoryTreeQueryVariables = {}) => {
  const response = await client.fetch({
    document: CategoryTreeQuery,
    variables,
    fetchOptions: { next: { revalidate: revalidateTarget } },
  });

  return response.data.site.categoryTree;
});

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
