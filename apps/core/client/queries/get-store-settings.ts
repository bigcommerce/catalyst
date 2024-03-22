import { cache } from 'react';

import { client } from '..';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';

const GET_STORE_SETTINGS_QUERY = graphql(`
  query getStoreSettings {
    site {
      settings {
        storeName
        logoV2 {
          __typename
          ... on StoreTextLogo {
            text
          }
          ... on StoreImageLogo {
            image {
              url: urlTemplate
              altText
            }
          }
        }
        contact {
          address
          email
          phone
        }
        socialMediaLinks {
          name
          url
        }
        status
        statusMessage
      }
    }
  }
`);

export const getStoreSettings = cache(async () => {
  const response = await client.fetch({
    document: GET_STORE_SETTINGS_QUERY,
    fetchOptions: { next: { revalidate } },
  });

  return response.data.site.settings;
});
