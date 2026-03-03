import { unstable_cache } from 'next/cache';
import { getLocale } from 'next-intl/server';
import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
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
          inventory {
            defaultOutOfStockMessage
            showOutOfStockMessage
            showBackorderMessage
          }
          storefront {
            catalog {
              productComparisonsEnabled
            }
          }
          display {
            showProductRating
          }
          reviews {
            enabled
          }
        }
      }
    }
  `,
  [BreadcrumbsCategoryFragment],
);

const getCachedCategoryPageData = unstable_cache(
  async (_locale: string, entityId: number) => {
    const response = await client.fetch({
      document: CategoryPageQuery,
      variables: { entityId },
      fetchOptions: { cache: 'no-store' },
    });

    return response.data.site;
  },
  ['get-category-page-data'],
  { revalidate },
);

export const getCategoryPageData = cache(async (entityId: number, customerAccessToken?: string) => {
  if (customerAccessToken) {
    const response = await client.fetch({
      document: CategoryPageQuery,
      variables: { entityId },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    return response.data.site;
  }

  const locale = await getLocale();

  return getCachedCategoryPageData(locale, entityId);
});
