import { cacheLife } from 'next/cache';
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

async function getCachedChangePasswordQuery(locale: string) {
  'use cache';

  cacheLife({ revalidate });

  const response = await client.fetch({
    document: ChangePasswordQuery,
    locale,
  });

  const passwordComplexitySettings =
    response.data.site.settings?.customers?.passwordComplexitySettings;

  return {
    passwordComplexitySettings,
  };
}

export const getChangePasswordQuery = cache(async (locale: string) => {
  return getCachedChangePasswordQuery(locale);
});
