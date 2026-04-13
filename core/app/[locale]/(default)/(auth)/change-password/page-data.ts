import { unstable_cache } from 'next/cache';
import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const ChangePasswordQuery = graphql(`
  query ChangePasswordQuery {
    site {
      settings {
        customers {
          passwordComplexitySettings {
            minimumNumbers
            minimumPasswordLength
            minimumSpecialCharacters
            requireLowerCase
            requireNumbers
            requireSpecialCharacters
            requireUpperCase
          }
        }
      }
    }
  }
`);

const getCachedChangePasswordQuery = unstable_cache(
  async () => {
    const response = await client.fetch({
      document: ChangePasswordQuery,
      fetchOptions: { cache: 'no-store' },
    });

    const passwordComplexitySettings =
      response.data.site.settings?.customers?.passwordComplexitySettings;

    return {
      passwordComplexitySettings,
    };
  },
  ['change-password-data'],
  { revalidate },
);

export const getChangePasswordQuery = cache(async () => {
  return getCachedChangePasswordQuery();
});
