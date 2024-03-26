import { cache } from 'react';

import { client } from '..';
import { FORM_FIELDS_FRAGMENT } from '../fragments/form-fields';
import { graphql, VariablesOf } from '../graphql';
import { revalidate } from '../revalidate-target';

const GET_ADDRESS_FORM_FIELDS = graphql(
  `
    query getAddressFormFields($filters: FormFieldFiltersInput, $sortBy: FormFieldSortInput) {
      site {
        settings {
          formFields {
            shippingAddress(filters: $filters, sortBy: $sortBy) {
              ...FormFields
            }
          }
        }
      }
    }
  `,
  [FORM_FIELDS_FRAGMENT],
);

type Variables = VariablesOf<typeof GET_ADDRESS_FORM_FIELDS>;

interface AddressFormFields {
  filters?: Variables['filters'];
  sortBy?: Variables['sortBy'];
}

export const getAddressFormFields = cache(async ({ filters, sortBy }: AddressFormFields) => {
  const response = await client.fetch({
    document: GET_ADDRESS_FORM_FIELDS,
    variables: { filters, sortBy },
    fetchOptions: { next: { revalidate } },
  });

  const { settings } = response.data.site;

  if (!settings) {
    return null;
  }

  return settings.formFields.shippingAddress;
});
