import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { FORM_FIELDS_FRAGMENT } from '~/client/fragments/form-fields';
import { graphql, VariablesOf } from '~/client/graphql';
import { PricingFragment } from '~/components/pricing';

import { GalleryFragment } from '../../product/[slug]/_components/gallery/fragment';

const WishlistQuery = graphql(
  `
    query WishlistQuery(
      $filters: WishlistFiltersInput
      $after: String
      $before: String
      $first: Int
      $last: Int
    ) {
      customer {
        wishlists(filters: $filters, after: $after, before: $before, first: $first, last: $last) {
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          edges {
            node {
              entityId
              name
              isPublic
              items {
                edges {
                  node {
                    entityId
                    product {
                      entityId
                      name
                      path
                      brand {
                        name
                        path
                      }
                      ...GalleryFragment
                      ...PricingFragment
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  [GalleryFragment, PricingFragment],
);

export interface WishlistArgs {
  after?: string;
  before?: string;
  limit?: number;
}

export const getWishlistQuery = cache(async ({ before, after, limit = 3 }: WishlistArgs) => {
  const customerId = await getSessionCustomerId();
  const paginationArgs = before ? { last: limit, before } : { first: limit, after };

  const response = await client.fetch({
    document: WishlistQuery,
    variables: { ...paginationArgs },
    fetchOptions: { cache: 'no-store' },
    customerId,
  });

  const { customer } = response.data;

  if (!customer) {
    return undefined;
  }

  return {
    pageInfo: customer.wishlists.pageInfo,
    wishlists: removeEdgesAndNodes(customer.wishlists).map((wishlist) => {
      return {
        ...wishlist,
        items: removeEdgesAndNodes(wishlist.items).map((item) => {
          return {
            ...item,
            product: {
              ...item.product,
              images: removeEdgesAndNodes(item.product.images),
            },
          };
        }),
      };
    }),
  };
});

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
