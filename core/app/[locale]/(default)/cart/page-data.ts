import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { TAGS } from '~/client/tags';
import { getPreferredCurrencyCode } from '~/lib/currency';

export const PhysicalItemFragment = graphql(`
  fragment PhysicalItemFragment on CartPhysicalItem {
    name
    brand
    sku
    image {
      url: urlTemplate(lossy: true)
    }
    entityId
    quantity
    productEntityId
    variantEntityId
    extendedListPrice {
      currencyCode
      value
    }
    extendedSalePrice {
      currencyCode
      value
    }
    originalPrice {
      currencyCode
      value
    }
    listPrice {
      currencyCode
      value
    }
    selectedOptions {
      __typename
      entityId
      name
      ... on CartSelectedMultipleChoiceOption {
        value
        valueEntityId
      }
      ... on CartSelectedCheckboxOption {
        value
        valueEntityId
      }
      ... on CartSelectedNumberFieldOption {
        number
      }
      ... on CartSelectedMultiLineTextFieldOption {
        text
      }
      ... on CartSelectedTextFieldOption {
        text
      }
      ... on CartSelectedDateFieldOption {
        date {
          utc
        }
      }
    }
    url
  }
`);

export const DigitalItemFragment = graphql(`
  fragment DigitalItemFragment on CartDigitalItem {
    name
    brand
    sku
    image {
      url: urlTemplate(lossy: true)
    }
    entityId
    quantity
    productEntityId
    variantEntityId
    extendedListPrice {
      currencyCode
      value
    }
    extendedSalePrice {
      currencyCode
      value
    }
    originalPrice {
      currencyCode
      value
    }
    listPrice {
      currencyCode
      value
    }
    selectedOptions {
      __typename
      entityId
      name
      ... on CartSelectedMultipleChoiceOption {
        value
        valueEntityId
      }
      ... on CartSelectedCheckboxOption {
        value
        valueEntityId
      }
      ... on CartSelectedNumberFieldOption {
        number
      }
      ... on CartSelectedMultiLineTextFieldOption {
        text
      }
      ... on CartSelectedTextFieldOption {
        text
      }
      ... on CartSelectedDateFieldOption {
        date {
          utc
        }
      }
    }
    url
  }
`);

const MoneyFieldsFragment = graphql(`
  fragment MoneyFieldsFragment on Money {
    currencyCode
    value
  }
`);

const ShippingInfoFragment = graphql(`
  fragment ShippingInfoFragment on Checkout {
    entityId
    shippingConsignments {
      entityId
      availableShippingOptions {
        cost {
          value
        }
        description
        entityId
        isRecommended
      }
      selectedShippingOption {
        entityId
        description
        cost {
          value
        }
      }
      address {
        city
        countryCode
        stateOrProvince
        postalCode
      }
    }
    handlingCostTotal {
      value
    }
    shippingCostTotal {
      currencyCode
      value
    }
  }
`);

const GeographyFragment = graphql(
  `
    fragment GeographyFragment on Geography {
      countries {
        entityId
        name
        code
        statesOrProvinces {
          entityId
          name
          abbreviation
        }
      }
    }
  `,
  [],
);

const CartPageQuery = graphql(
  `
    query CartPageQuery($cartId: String) {
      site {
        settings {
          url {
            checkoutUrl
          }
        }
        cart(entityId: $cartId) {
          entityId
          version
          currencyCode
          discountedAmount {
            ...MoneyFieldsFragment
          }
          amount {
            value
          }
          lineItems {
            physicalItems {
              ...PhysicalItemFragment
            }
            digitalItems {
              ...DigitalItemFragment
            }
            totalQuantity
          }
        }
        checkout(entityId: $cartId) {
          entityId
          subtotal {
            ...MoneyFieldsFragment
          }
          grandTotal {
            ...MoneyFieldsFragment
          }
          taxTotal {
            ...MoneyFieldsFragment
          }
          cart {
            currencyCode
          }
          coupons {
            code
            discountedAmount {
              ...MoneyFieldsFragment
            }
          }
          ...ShippingInfoFragment
        }
      }
      geography {
        ...GeographyFragment
      }
    }
  `,
  [
    PhysicalItemFragment,
    DigitalItemFragment,
    MoneyFieldsFragment,
    ShippingInfoFragment,
    GeographyFragment,
  ],
);

type Variables = VariablesOf<typeof CartPageQuery>;

export const getCart = async (variables: Variables) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: CartPageQuery,
    variables,
    customerAccessToken,
    fetchOptions: {
      cache: 'no-store',
      next: {
        tags: [TAGS.cart, TAGS.checkout],
      },
    },
  });

  return data;
};

const SupportedShippingDestinationsQuery = graphql(`
  query SupportedShippingDestinations {
    site {
      settings {
        shipping {
          supportedShippingDestinations {
            countries {
              entityId
              code
              name
              statesOrProvinces {
                entityId
                name
                abbreviation
              }
            }
          }
        }
      }
    }
  }
`);
const PaymentWalletsQuery = graphql(`
  query PaymentWalletsQuery($filters: PaymentWalletsFilterInput) {
    site {
      paymentWallets(filter: $filters) {
        edges {
          node {
            entityId
            methodName
            id
          }
        }
      }
    }
  }
`);

type PaymentWalletsVariables = VariablesOf<typeof PaymentWalletsQuery>;

export const getPaymentWallets = async (variables: PaymentWalletsVariables) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: PaymentWalletsQuery,
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
    variables,
  });

  console.log(data.site.paymentWallets, 'data.site.paymentWallets');

  return removeEdgesAndNodes(data.site.paymentWallets).map(({ entityId }) => entityId);
};

const PaymentWalletWithInitializationDataQuery = graphql(`
  query PaymentWalletWithInitializationDataQuery($entityId: String!, $cartId: String!) {
    site {
      paymentWalletWithInitializationData(
        filter: { paymentWalletEntityId: $entityId, cartEntityId: $cartId }
      ) {
        clientToken
        initializationData
      }
    }
  }
`);

export const getPaymentWalletWithInitializationData = async (entityId: string, cartId: string) => {
  const { data } = await client.fetch({
    document: PaymentWalletWithInitializationDataQuery,
    variables: {
      entityId,
      cartId,
    },
    customerAccessToken: await getSessionCustomerAccessToken(),
    fetchOptions: { cache: 'no-store' },
  });

  return data.site.paymentWalletWithInitializationData;
};

const CurrencyQuery = graphql(`
  query Currency($currencyCode: currencyCode!) {
    site {
      currency(currencyCode: $currencyCode) {
        display {
          decimalPlaces
          symbol
        }
        name
        code
      }
    }
  }
`);

export const getCurrencyData = async (currencyCode?: string) => {
  const code = await getPreferredCurrencyCode(currencyCode);

  if (!code) {
    throw new Error('Could not get currency code');
  }

  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: CurrencyQuery,
    fetchOptions: { cache: 'no-store' },
    variables: {
      currencyCode: code,
    },
    customerAccessToken,
  });

  return data.site.currency;
};

export const getShippingCountries = cache(async () => {
  const { data } = await client.fetch({
    document: SupportedShippingDestinationsQuery,
    fetchOptions: { next: { revalidate } },
  });

  return data.site.settings?.shipping?.supportedShippingDestinations.countries ?? [];
});
