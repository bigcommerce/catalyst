import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const SearchPageQuery = graphql(`
  query SearchPageQuery {
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

export const getSearchPageData = cache(async () => {
  const response = await client.fetch({
    document: SearchPageQuery,
    fetchOptions: { next: { revalidate } },
  });

  return response.data.site;
});
