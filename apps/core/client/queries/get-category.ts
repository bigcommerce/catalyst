import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../generated';

export const GET_CATEGORY_QUERY = /* GraphQL */ `
  query getCategory(
    $after: String
    $before: String
    $breadcrumbDepth: Int!
    $categoryId: Int!
    $first: Int
    $last: Int
  ) {
    site {
      category(entityId: $categoryId) {
        name
        description
        path
        products(after: $after, before: $before, first: $first, last: $last) {
          pageInfo {
            ...PageDetails
          }
          edges {
            node {
              entityId
              name
              path
              brand {
                name
              }
              prices {
                price {
                  value
                }
              }
              defaultImage {
                url(width: 300)
                altText
              }
            }
          }
        }
        breadcrumbs(depth: $breadcrumbDepth) {
          edges {
            node {
              entityId
              name
              path
            }
          }
        }
      }
    }
  }
`;

export interface CategoryOptions {
  after?: string;
  before?: string;
  breadcrumbDepth?: number;
  categoryId: number;
  limit?: number;
}

export const getCategory = cache(
  async ({ categoryId, limit = 9, before, after, breadcrumbDepth = 10 }: CategoryOptions) => {
    const query = graphql(GET_CATEGORY_QUERY);
    const customerId = await getSessionCustomerId();

    const paginationArgs = before ? { last: limit, before } : { first: limit, after };

    const response = await client.fetch({
      document: query,
      variables: { categoryId, breadcrumbDepth, ...paginationArgs },
      customerId,
      fetchOptions: {
        cache: customerId ? 'no-store' : 'force-cache',
      },
    });

    const category = response.data.site.category;

    if (!category) {
      return undefined;
    }

    return {
      ...category,
      products: {
        pageInfo: category.products.pageInfo,
        items: removeEdgesAndNodes(category.products),
      },
      breadcrumbs: {
        items: removeEdgesAndNodes(category.breadcrumbs),
      },
    };
  },
);
