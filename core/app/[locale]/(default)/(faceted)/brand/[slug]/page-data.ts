import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const BrandPageQuery = graphql(`
  query BrandPageQuery($entityId: Int!, $locale: String) @shopperPreferences(locale: $locale) {
    site {
      brand(entityId: $entityId) {
        name
        seo {
          pageTitle
          metaDescription
          metaKeywords
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
`);

export const getBrandPageData = cache(
  async (entityId: number, locale: string, customerAccessToken?: string) => {
    const response = await client.fetch({
      document: BrandPageQuery,
      variables: { entityId, locale },
      customerAccessToken,
      fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
    });

    return response.data.site;
  },
);
