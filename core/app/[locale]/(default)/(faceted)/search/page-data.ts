import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const SearchPageQuery = graphql(`
  query SearchPageQuery($locale: String) @shopperPreferences(locale: $locale) {
    site {
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

export const getSearchPageData = cache(async (locale: string) => {
  const response = await client.fetch({
    document: SearchPageQuery,
    variables: { locale },
    fetchOptions: { next: { revalidate } },
  });

  return response.data.site;
});
