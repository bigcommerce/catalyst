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
  async (locale: string) => {
    const response = await client.fetch({
      document: ChangePasswordQuery,
      locale,
    });

    const passwordComplexitySettings =
      response.data.site.settings?.customers?.passwordComplexitySettings;

    return {
      passwordComplexitySettings,
    };
  },
  ['get-change-password-query'],
  { revalidate },
);

export const getChangePasswordQuery = cache(async (locale: string) => {
  return getCachedChangePasswordQuery(locale);
});
