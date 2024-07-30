import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const storeNameQuery = graphql(`
  query storeNameQuery {
    site {
      settings {
        storeName
      }
    }
  }
`);

export const getStoreName = cache(async () => {
  const { data } = await client.fetch({
    document: storeNameQuery,
    fetchOptions: { next: { revalidate } },
  });

  return data.site.settings?.storeName;
});
