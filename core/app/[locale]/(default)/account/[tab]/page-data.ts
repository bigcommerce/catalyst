import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { FORM_FIELDS_FRAGMENT } from '~/client/fragments/form-fields';
import { graphql, VariablesOf } from '~/client/graphql';

const CustomerSettingsQuery = graphql(
  `
    query CustomerSettingsQuery(
      $customerFilters: FormFieldFiltersInput
      $customerSortBy: FormFieldSortInput
      $addressFilters: FormFieldFiltersInput
      $addressSortBy: FormFieldSortInput
    ) {
      customer {
        entityId
        company
        email
        firstName
        lastName
        phone
        formFields {
          entityId
          name
          __typename
          ... on CheckboxesFormFieldValue {
            valueEntityIds
            values
          }
          ... on DateFormFieldValue {
            date {
              utc
            }
          }
          ... on MultipleChoiceFormFieldValue {
            valueEntityId
            value
          }
          ... on NumberFormFieldValue {
            number
          }
          ... on PasswordFormFieldValue {
            password
          }
          ... on TextFormFieldValue {
            text
          }
        }
      }
      site {
        settings {
          formFields {
            customer(filters: $customerFilters, sortBy: $customerSortBy) {
              ...FormFields
            }
            shippingAddress(filters: $addressFilters, sortBy: $addressSortBy) {
              ...FormFields
            }
          }
          reCaptcha {
            isEnabledOnStorefront
            siteKey
          }
        }
      }
    }
  `,
  [FORM_FIELDS_FRAGMENT],
);

const CustomerAllOrders = graphql(`
  query CustomerAllOrders($after: String, $before: String, $first: Int, $last: Int) {
    site {
      orders(after: $after, before: $before, first: $first, last: $last) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        edges {
          node {
            entityId
            orderedAt {
              utc
            }
            status {
              label
              value
            }
            totalIncTax {
              value
              currencyCode
            }
            consignments {
              shipping(before: $before, after: $after, first: $first, last: $last) {
                edges {
                  node {
                    lineItems {
                      edges {
                        node {
                          entityId
                          brand
                          name
                          image {
                            altText
                            url: urlTemplate
                          }
                          subTotalListPrice {
                            value
                            currencyCode
                          }
                          quantity
                        }
                      }
                    }
                    shipments(before: $before, after: $after, first: $first, last: $last) {
                      edges {
                        node {
                          shippingMethodName
                          shippingProviderName
                          tracking {
                            __typename
                            ... on OrderShipmentNumberAndUrlTracking {
                              number
                              url
                            }
                            ... on OrderShipmentUrlOnlyTracking {
                              url
                            }
                            ... on OrderShipmentNumberOnlyTracking {
                              number
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof CustomerSettingsQuery>;

interface Props {
  address?: {
    filters?: Variables['addressFilters'];
    sortBy?: Variables['addressSortBy'];
  };

  customer?: {
    filters?: Variables['customerFilters'];
    sortBy?: Variables['customerSortBy'];
  };
}

export const getCustomerSettingsQuery = cache(async ({ address, customer }: Props = {}) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: CustomerSettingsQuery,
    variables: {
      addressFilters: address?.filters,
      addressSortBy: address?.sortBy,
      customerFilters: customer?.filters,
      customerSortBy: customer?.sortBy,
    },
    fetchOptions: { cache: 'no-store' },
    customerId,
  });

  const addressFields = response.data.site.settings?.formFields.shippingAddress;
  const customerFields = response.data.site.settings?.formFields.customer;
  const customerInfo = response.data.customer;

  const reCaptchaSettings = response.data.site.settings?.reCaptcha;

  if (!addressFields || !customerFields || !customerInfo) {
    return null;
  }

  return {
    addressFields,
    customerFields,
    customerInfo,
    reCaptchaSettings,
  };
});

interface CustomerOrdersArgs {
  after?: string;
  before?: string;
  limit?: number;
}

export const getCustomerOrders = cache(
  async ({ before = '', after = '', limit = 2 }: CustomerOrdersArgs) => {
    const customerId = await getSessionCustomerId();
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };

    const response = await client.fetch({
      document: CustomerAllOrders,
      variables: { ...paginationArgs },
      customerId,
      fetchOptions: { cache: 'no-store' },
    });
    const orders = response.data.site.orders;

    if (!orders) {
      return undefined;
    }

    const data = {
      orders: removeEdgesAndNodes(orders).map((order) => ({
        ...order,
        consignments: {
          ...(order.consignments?.shipping && {
            shipping: removeEdgesAndNodes(order.consignments.shipping),
          }),
        },
      })),
      pageInfo: orders.pageInfo,
    };

    // TODO: check approach to get product path later

    return data;
  },
);
