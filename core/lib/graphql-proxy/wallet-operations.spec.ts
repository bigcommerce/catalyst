import { describe, expect, it } from 'vitest';

import { parseAllowedWalletOperation } from './wallet-operations';

// Documents as sent by checkout-sdk-js's wallet-button-integration package.
const walletOperations = {
  createPaymentWalletIntent: `
    mutation CreatePaymentWalletIntentMutation(
      $input: CreatePaymentWalletIntentInput!
    ) {
      payment {
        paymentWallet {
          createPaymentWalletIntent(input: $input) {
            paymentWalletIntentData {
              __typename
              ... on PayPalCommercePaymentWalletIntentData {
                orderId
                approvalUrl
                initializationEntityId
              }
            }
            errors {
              __typename
              ... on CreatePaymentWalletIntentGenericError {
                message
              }
              ... on Error {
                message
              }
            }
          }
        }
      }
    }
  `,
  updateCheckoutBillingAddress: `
    mutation UpdateCheckoutBillingAddressMutation(
      $input: UpdateCheckoutBillingAddressInput!
    ) {
      checkout {
        updateCheckoutBillingAddress(input: $input) {
          checkout {
            billingAddress {
              address1
              address2
              city
              company
              countryCode
              email
              entityId
              firstName
              lastName
              phone
              postalCode
              stateOrProvince
              stateOrProvinceCode
            }
          }
        }
      }
    }
  `,
  addCheckoutBillingAddress: `
    mutation AddCheckoutBillingAddressMutation(
      $input: AddCheckoutBillingAddressInput!
    ) {
      checkout {
        addCheckoutBillingAddress(input: $input) {
          checkout {
            billingAddress {
              address1
              entityId
            }
          }
        }
      }
    }
  `,
  createCartRedirectUrls: `
    mutation CheckoutRedirectMutation($input: CreateCartRedirectUrlsInput!) {
      cart {
        createCartRedirectUrls(input: $input) {
          errors {
           __typename
          ... on NotFoundError {
                  message
              }
          }
          redirectUrls {
            externalCheckoutUrl
          }
        }
      }
    }
  `,
};

describe('parseAllowedWalletOperation', () => {
  it.each(Object.entries(walletOperations))('allows the %s wallet operation', (_, query) => {
    expect(parseAllowedWalletOperation(query)).not.toBeNull();
  });

  it('allows other payment wallet intent typenames', () => {
    const query = walletOperations.createPaymentWalletIntent.replace(
      'PayPalCommercePaymentWalletIntentData',
      'BigCommercePaymentsPaymentWalletIntentData',
    );

    expect(parseAllowedWalletOperation(query)).not.toBeNull();
  });

  it.each([
    [
      'a cart creation mutation',
      `mutation CreateCart($input: CreateCartInput!) {
        cart { createCart(input: $input) { cart { entityId } } }
      }`,
    ],
    [
      'a cart mutation using an allowed operation name',
      `mutation CheckoutRedirectMutation($input: CreateCartInput!) {
        cart { createCart(input: $input) { cart { entityId } } }
      }`,
    ],
    [
      'an allowed operation with an extra field alongside it',
      `mutation CheckoutRedirectMutation($input: CreateCartRedirectUrlsInput!, $cart: CreateCartInput!) {
        cart {
          createCartRedirectUrls(input: $input) { redirectUrls { externalCheckoutUrl } }
          createCart(input: $cart) { cart { entityId } }
        }
      }`,
    ],
    [
      'an allowed operation with an extra root field',
      `mutation CheckoutRedirectMutation($input: CreateCartRedirectUrlsInput!, $cart: CreateCartInput!) {
        cart { createCartRedirectUrls(input: $input) { redirectUrls { externalCheckoutUrl } } }
        other: cart { createCart(input: $cart) { cart { entityId } } }
      }`,
    ],
    [
      'an aliased field that is not the allowed one',
      `mutation CheckoutRedirectMutation($input: CreateCartInput!) {
        cart { createCartRedirectUrls: createCart(input: $input) { cart { entityId } } }
      }`,
    ],
    [
      'an allowed operation that smuggles fields through a fragment',
      `mutation CheckoutRedirectMutation($input: CreateCartInput!) {
        cart { ...Smuggled }
      }
      fragment Smuggled on CartMutations { createCart(input: $input) { cart { entityId } } }`,
    ],
    [
      'an allowed operation that smuggles fields through an inline fragment',
      `mutation CheckoutRedirectMutation($input: CreateCartInput!) {
        cart { ... on CartMutations { createCart(input: $input) { cart { entityId } } } }
      }`,
    ],
    [
      'an allowed operation alongside a second operation',
      `${walletOperations.createCartRedirectUrls}
      mutation AddLineItems($input: AddCartLineItemsInput!) {
        cart { addCartLineItems(input: $input) { cart { entityId } } }
      }`,
    ],
    [
      'a query using an allowed operation name',
      `query CheckoutRedirectMutation {
        cart { createCartRedirectUrls { redirectUrls { externalCheckoutUrl } } }
      }`,
    ],
    ['an anonymous query', `{ customer { email } }`],
    ['an unparseable document', `mutation {`],
  ])('rejects %s', (_, query) => {
    expect(parseAllowedWalletOperation(query)).toBeNull();
  });
});
