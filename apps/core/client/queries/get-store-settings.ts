import { cache } from 'react';

import { client } from '..';
import { graphql } from '../generated';

export const GET_STORE_SETTINGS_QUERY = /* GraphQL */ `
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
              url(width: 155)
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
`;

export const getStoreSettings = cache(async () => {
  const query = graphql(GET_STORE_SETTINGS_QUERY);
  const response = await client.fetch({ document: query });

  return response.data.site.settings;
});
