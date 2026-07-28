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

export const getChangePasswordQuery = cache(async () => {
  const response = await client.fetch({
    document: ChangePasswordQuery,
    fetchOptions: { next: { revalidate } },
  });

  const passwordComplexitySettings =
    response.data.site.settings?.customers?.passwordComplexitySettings;

  return {
    passwordComplexitySettings,
  };
});
