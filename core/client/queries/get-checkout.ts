import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const MoneyFieldsFragment = graphql(`
  fragment MoneyFieldsFragment on Money {
    currencyCode
    value
  }
`);

const CheckoutPromotionFieldsFragment = graphql(`
  fragment CheckoutPromotionFieldsFragment on CheckoutPromotion {
    banners {
      entityId
      type
      locations
      text
    }
  }
`);

const CheckoutTaxFieldsFragment = graphql(`
  fragment CheckoutTaxFieldsFragment on CheckoutTax {
    name
    amount {
      ...MoneyFieldsFragment
    }
  }
`);

const CheckoutAddressFieldsFragment = graphql(`
  fragment CheckoutAddressFieldsFragment on CheckoutAddress {
    firstName
    lastName
    email
    company
    address1
    address2
    city
    stateOrProvince
    stateOrProvinceCode
    countryCode
    postalCode
    phone
    customFields {
      entityId
      ... on CheckoutAddressCheckboxesCustomField {
        valueEntityIds
      }
      ... on CheckoutAddressDateCustomField {
        date {
          utc
        }
      }
      ... on CheckoutAddressMultipleChoiceCustomField {
        valueEntityId
      }
      ... on CheckoutAddressNumberCustomField {
        number
      }
      ... on CheckoutAddressPasswordCustomField {
        password
      }
      ... on CheckoutAddressTextFieldCustomField {
        text
      }
    }
  }
`);

const CheckoutConsignmentAddressFieldsFragment = graphql(
  `
    fragment CheckoutConsignmentAddressFieldsFragment on CheckoutConsignmentAddress {
      ...CheckoutAddressFieldsFragment
    }
  `,
  [CheckoutAddressFieldsFragment],
);

const CheckoutAvailableShippingOptionFieldsFragment = graphql(
  `
    fragment CheckoutAvailableShippingOptionFieldsFragment on CheckoutAvailableShippingOption {
      entityId
      description
      type
      imageUrl
      cost {
        ...MoneyFieldsFragment
      }
      transitTime
      isRecommended
    }
  `,
  [MoneyFieldsFragment],
);

const CheckoutSelectedShippingOptionFieldsFragment = graphql(
  `
    fragment CheckoutSelectedShippingOptionFieldsFragment on CheckoutSelectedShippingOption {
      entityId
      description
      type
      imageUrl
      cost {
        ...MoneyFieldsFragment
      }
      transitTime
    }
  `,
  [MoneyFieldsFragment],
);

const CheckoutCouponFieldsFragment = graphql(
  `
    fragment CheckoutCouponFieldsFragment on CheckoutCoupon {
      entityId
      code
      couponType
      discountedAmount {
        ...MoneyFieldsFragment
      }
    }
  `,
  [MoneyFieldsFragment],
);

const CheckoutShippingConsignmentFieldsFragment = graphql(
  `
    fragment CheckoutShippingConsignmentFieldsFragment on CheckoutShippingConsignment {
      entityId
      address {
        ...CheckoutConsignmentAddressFieldsFragment
      }
      availableShippingOptions {
        ...CheckoutAvailableShippingOptionFieldsFragment
      }
      selectedShippingOption {
        ...CheckoutSelectedShippingOptionFieldsFragment
      }
      coupons {
        ...CheckoutCouponFieldsFragment
      }
      shippingCost {
        ...MoneyFieldsFragment
      }
      handlingCost {
        ...MoneyFieldsFragment
      }
      lineItemIds
    }
  `,
  [
    MoneyFieldsFragment,
    CheckoutConsignmentAddressFieldsFragment,
    CheckoutAvailableShippingOptionFieldsFragment,
    CheckoutSelectedShippingOptionFieldsFragment,
    CheckoutCouponFieldsFragment,
  ],
);

const CheckoutBillingAddressFieldsFragment = graphql(
  `
    fragment CheckoutBillingAddressFieldsFragment on CheckoutBillingAddress {
      entityId
      ...CheckoutAddressFieldsFragment
    }
  `,
  [CheckoutAddressFieldsFragment],
);

const CheckoutQuery = graphql(
  `
    query getCheckout($entityId: String!) {
      site {
        checkout(entityId: $entityId) {
          entityId
          billingAddress {
            ...CheckoutBillingAddressFieldsFragment
          }
          shippingConsignments {
            ...CheckoutShippingConsignmentFieldsFragment
          }
          order {
            entityId
          }
          shippingCostTotal {
            ...MoneyFieldsFragment
          }
          giftWrappingCostTotal {
            ...MoneyFieldsFragment
          }
          handlingCostTotal {
            ...MoneyFieldsFragment
          }
          taxTotal {
            ...MoneyFieldsFragment
          }
          taxes {
            ...CheckoutTaxFieldsFragment
          }
          subtotal {
            ...MoneyFieldsFragment
          }
          grandTotal {
            ...MoneyFieldsFragment
          }
          createdAt {
            utc
          }
          updatedAt {
            utc
          }
          customerMessage
          outstandingBalance {
            ...MoneyFieldsFragment
          }
          coupons {
            ...CheckoutCouponFieldsFragment
          }
          promotions {
            ...CheckoutPromotionFieldsFragment
          }
        }
      }
    }
  `,
  [
    MoneyFieldsFragment,
    CheckoutBillingAddressFieldsFragment,
    CheckoutShippingConsignmentFieldsFragment,
    CheckoutTaxFieldsFragment,
    CheckoutCouponFieldsFragment,
    CheckoutPromotionFieldsFragment,
  ],
);

export const getCheckout = async (entityId: string) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    return await client.fetch({
      document: CheckoutQuery,
      variables: {
        entityId,
      },
      fetchOptions: { cache: 'no-store' },
      customerAccessToken,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    throw error;
  }
};
