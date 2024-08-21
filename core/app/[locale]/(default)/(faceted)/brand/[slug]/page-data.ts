import { cache } from 'react';

import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const BrandQuery = graphql(`
  query BrandQuery($entityId: Int!) {
    site {
      brand(entityId: $entityId) {
        name
        seo {
          pageTitle
          metaDescription
          metaKeywords
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof BrandQuery>;

export const getBrand = cache(async (variables: Variables) => {
  const response = await client.fetch({
    document: BrandQuery,
    variables,
    fetchOptions: { next: { revalidate } },
  });

  return response.data.site.brand;
});
