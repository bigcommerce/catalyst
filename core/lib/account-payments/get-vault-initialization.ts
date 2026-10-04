import 'server-only';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

// Each provider has its own vault initialization field, returning its own type.
// `initializationType` is aliased from `__typename`, which is what the microapp discriminates on.
// Errors are a union of types implementing `Error`, so `message` is selected through a fragment.
const CreateStripeOcsVaultInitializationMutation = graphql(`
  mutation CreateStripeOcsVaultInitialization($input: CreateStripeOcsVaultInitializationInput!) {
    customer {
      storedPaymentInstruments {
        createStripeOcsVaultInitialization(input: $input) {
          initialization {
            initializationType: __typename
            setupIntentClientSecret
            publishableKey
            connectedAccountId
          }
          errors {
            ... on Error {
              message
            }
          }
        }
      }
    }
  }
`);

// Square v2 initialization is a query, because it reads the merchant's configuration and creates nothing at Square.
const SquareV2VaultInitializationQuery = graphql(`
  query SquareV2VaultInitialization {
    customer {
      squareV2VaultInitialization {
        initialization {
          initializationType: __typename
          applicationId
          locationId
          environment
        }
        errors {
          ... on Error {
            message
          }
        }
      }
    }
  }
`);

export class UnsupportedVaultInitializationError extends Error {
  constructor(paymentMethodId: string) {
    super(`No vault initialization exists for payment method ${paymentMethodId}`);
  }
}

interface VaultInitializationResult<T> {
  initialization: T | null;
  errors: Array<{ message: string }>;
}

function unwrap<T>(fieldName: string, result: VaultInitializationResult<T> | null | undefined): T {
  if (!result) {
    throw new Error(
      `Failed to create vault initialization: ${fieldName} resolved to null (no field errors)`,
    );
  }

  if (result.errors.length > 0) {
    const message = result.errors.map((error) => error.message).join(', ');

    throw new Error(`Failed to create vault initialization: ${message}`);
  }

  if (!result.initialization) {
    throw new Error(`Failed to create vault initialization: ${fieldName} returned no data`);
  }

  return result.initialization;
}

async function createStripeOcsVaultInitialization(
  paymentMethod: 'ACH' | 'CARD',
  customerAccessToken?: string,
  channelId?: string,
) {
  const { data } = await client.fetch({
    document: CreateStripeOcsVaultInitializationMutation,
    variables: { input: { paymentMethod } },
    customerAccessToken,
    channelId,
    fetchOptions: { cache: 'no-store' },
  });

  return unwrap(
    'createStripeOcsVaultInitialization',
    data.customer.storedPaymentInstruments.createStripeOcsVaultInitialization,
  );
}

async function getSquareV2VaultInitialization(customerAccessToken?: string, channelId?: string) {
  const { data } = await client.fetch({
    document: SquareV2VaultInitializationQuery,
    customerAccessToken,
    channelId,
    fetchOptions: { cache: 'no-store' },
  });

  return unwrap('squareV2VaultInitialization', data.customer?.squareV2VaultInitialization);
}

export async function getVaultInitialization(paymentMethodId: string, channelId?: string) {
  const customerAccessToken = await getSessionCustomerAccessToken();

  switch (paymentMethodId) {
    case 'stripeocs.card':
      return createStripeOcsVaultInitialization('CARD', customerAccessToken, channelId);

    case 'stripeocs.ach':
      return createStripeOcsVaultInitialization('ACH', customerAccessToken, channelId);

    case 'squarev2.card':
      return getSquareV2VaultInitialization(customerAccessToken, channelId);

    default:
      throw new UnsupportedVaultInitializationError(paymentMethodId);
  }
}
