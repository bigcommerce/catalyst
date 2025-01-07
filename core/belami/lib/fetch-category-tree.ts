'use server';

//import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

interface Category {
  name: string;
  path: string;
  entityId: number;
  children?: Category[];
}

const CategoryTreeQuery = function() {
  return graphql(`query CategoryTree4LevelsDeep {
      site {
        categoryTree {
          ...CategoryFields
          children {
            ...CategoryFields
            children {
              ...CategoryFields
              children {
                ...CategoryFields
              }
            }
          }
        }
      }
    }
    fragment CategoryFields on CategoryTreeItem {
      name
      path
      entityId
    }`
  );
}

export async function getCategoryTree(customerAccessToken: string | undefined) {
  //const customerAccessToken = await getSessionCustomerAccessToken();

  const { data }: any = await client.fetch({
    document: CategoryTreeQuery(),
    customerAccessToken,
    fetchOptions: { cache: 'force-cache' },
  });

  return data?.site?.categoryTree;
}

export async function getCategoriesMap(customerAccessToken: string | undefined): Promise<{ [key: number]: string }> {

  const categoryTree = await getCategoryTree(customerAccessToken);

  const result: { [key: number]: string } = {};

  function traverse(categories: Category[]) {
    for (const category of categories) {
      result[category.entityId] = category.name;
      if (category.children) {
        traverse(category.children);
      }
    }
  }

  traverse(categoryTree);

  return result;
}