import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { BreadcrumbsCategoryFragment } from '~/components/breadcrumbs/fragment';

const CategoryPageQuery = graphql(
  `
    query CategoryPageQuery($entityId: Int!) {
      site {
        category(entityId: $entityId) {
          entityId
          name
          ...BreadcrumbsFragment
          seo {
            pageTitle
            metaDescription
            metaKeywords
          }
        }
        categoryTree(rootEntityId: $entityId) {
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
        settings {
          storefront {
            catalog {
              productComparisonsEnabled
            }
          }
        }
      }
    }
  `,
  [BreadcrumbsCategoryFragment],
);

export const getCategoryPageData = cache(async (entityId: number) => {
  const response = await client.fetch({
    document: CategoryPageQuery,
    variables: { entityId },
  });

  return response.data.site;
});
