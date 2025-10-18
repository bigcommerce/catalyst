import { cache } from 'react';

import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const BrandPageQuery = graphql(`
  query BrandPageQuery($entityId: Int!) {
    site {
      brand(entityId: $entityId) {
        name
        path
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

type Variables = VariablesOf<typeof BrandPageQuery>;

export const getBrandPageData = cache(async (variables: Variables) => {
  const response = await client.fetch({
    document: BrandPageQuery,
    variables,
    fetchOptions: { next: { revalidate } },
  });

  return response.data.site;
});
