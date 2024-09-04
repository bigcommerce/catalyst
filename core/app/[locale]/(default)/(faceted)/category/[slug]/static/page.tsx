import { cache } from 'react';

import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate as revalidateTarget } from '~/client/revalidate-target';
import { ExistingResultType } from '~/client/util';
import { locales } from '~/i18n/routing';

import { CategoryTreeFragment } from '../_components/sub-categories';
import CategoryPage from '../page';

export default CategoryPage;

export { generateMetadata } from '../page';

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

type Variables = VariablesOf<typeof CategoryTreeQuery>;

const getCategoryTree = cache(async (variables: Variables = {}) => {
  const response = await client.fetch({
    document: CategoryTreeQuery,
    variables,
    fetchOptions: { next: { revalidate: revalidateTarget } },
    channelId: getChannelIdFromLocale(), // Using default channel id
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
