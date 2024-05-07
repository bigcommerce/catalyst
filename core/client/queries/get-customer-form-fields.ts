import { cache } from 'react';

import { client } from '..';
import { FORM_FIELDS_FRAGMENT } from '../fragments/form-fields';
import { graphql, VariablesOf } from '../graphql';
import { revalidate } from '../revalidate-target';

const GET_CUSTOMER_FORM_FIELDS = graphql(
  `
    query getCustomerFormFields($filters: FormFieldFiltersInput, $sortBy: FormFieldSortInput) {
      site {
        settings {
          formFields {
            customer(filters: $filters, sortBy: $sortBy) {
              ...FormFields
            }
          }
        }
      }
    }
  `,
  [FORM_FIELDS_FRAGMENT],
);

type Variables = VariablesOf<typeof GET_CUSTOMER_FORM_FIELDS>;

interface CustomerFormFields {
  filters?: Variables['filters'];
  sortBy?: Variables['sortBy'];
}

export const getCustomerFormFields = cache(async ({ filters, sortBy }: CustomerFormFields) => {
  const response = await client.fetch({
    document: GET_CUSTOMER_FORM_FIELDS,
    variables: { filters, sortBy },
    fetchOptions: { next: { revalidate } },
  });

  const { settings } = response.data.site;

  if (!settings) {
    return null;
  }

  return settings.formFields.customer;
});
