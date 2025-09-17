import { cache } from 'react';

import { client } from '~/client';
import { TaxSettingsFragment } from '~/client/fragments/pricing';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const SearchPageQuery = graphql(
  `
    query SearchPageQuery {
      site {
        settings {
          ...TaxSettingsFragment
          storefront {
            catalog {
              productComparisonsEnabled
            }
          }
        }
      }
    }
  `,
  [TaxSettingsFragment],
);

export const getSearchPageData = cache(async () => {
  const response = await client.fetch({
    document: SearchPageQuery,
    fetchOptions: { next: { revalidate } },
  });

  return response.data.site;
});
