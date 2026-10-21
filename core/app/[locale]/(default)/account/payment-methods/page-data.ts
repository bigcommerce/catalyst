import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const PaymentMethodsPageDataQuery = graphql(`
  query PaymentMethodsPageDataQuery($first: Int!) {
    site {
      paymentMethods {
        edges {
          node {
            entityId
            name
            capabilities {
              vaulting {
                actions {
                  isAddSupported
                  isDeleteSupported
                  isEditSupported
                }
                configuration {
                  isCustomerVaultingEnabled
                }
                requirements {
                  isInitializationRequired
                }
              }
            }
          }
        }
      }
    }
    customer {
      storedPaymentInstruments(first: $first) {
        edges {
          node {
            token
            paymentMethodId
            details {
              __typename
              ... on StoredCard {
                last4
                billingAddress {
                  firstName
                  lastName
                }
              }
            }
          }
        }
      }
    }
  }
`);

const MAX_PAGE_SIZE = 50;

// Provider ids whose `ClientConfiguration` union member is selected in
// `CreateVaultInitializationMutation` (/lib/account-payments/get-vault-initialization)
const VAULT_INITIALIZATION_SUPPORTED_PROVIDERS = ['squarev2', 'stripeocs'];

function isVaultInitializationSupported(paymentMethodId: string) {
  return VAULT_INITIALIZATION_SUPPORTED_PROVIDERS.includes(paymentMethodId.split('.')[0] ?? '');
}

function isCreditCard(paymentMethodId: string) {
  return paymentMethodId.split('.')[1] === 'credit_card';
}

export async function getPaymentMethodsPageData() {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: PaymentMethodsPageDataQuery,
    variables: { first: MAX_PAGE_SIZE },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  const paymentMethods = (data.site.paymentMethods?.edges ?? [])
    .map(({ node }) => ({
      id: node.entityId,
      name: node.name,
      isCustomerVaultingEnabled:
        node.capabilities?.vaulting?.configuration.isCustomerVaultingEnabled ?? false,
      isAddSupported: node.capabilities?.vaulting?.actions.isAddSupported ?? false,
      isDeleteSupported: node.capabilities?.vaulting?.actions.isDeleteSupported ?? false,
      isEditSupported: node.capabilities?.vaulting?.actions.isEditSupported ?? false,
      isInitializationRequired:
        node.capabilities?.vaulting?.requirements.isInitializationRequired ?? false,
    }))
    .filter(
      ({ id, isCustomerVaultingEnabled, isInitializationRequired }) =>
        isCustomerVaultingEnabled &&
        isCreditCard(id) &&
        (!isInitializationRequired || isVaultInitializationSupported(id)),
    );

  const storedInstruments = (data.customer?.storedPaymentInstruments.edges ?? []).map(
    ({ node }) => node,
  );

  return { paymentMethods, storedInstruments };
}
