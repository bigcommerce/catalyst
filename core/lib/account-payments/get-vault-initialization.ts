import 'server-only';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const CreateVaultInitializationMutation = graphql(`
  mutation CreateVaultInitialization($input: CreateVaultInitializationInput!) {
    customer {
      storedPaymentInstruments {
        createVaultInitialization(input: $input) {
          token
          clientConfiguration {
            clientConfigType: __typename
            ... on SquareV2ClientConfiguration {
              applicationId
              locationId
              environment
            }
          }
          errors {
            message
          }
        }
      }
    }
  }
`);

export async function getVaultInitialization(paymentMethodId: string, channelId?: string) {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const { data } = await client.fetch({
    document: CreateVaultInitializationMutation,
    variables: { input: { paymentMethodId } },
    customerAccessToken,
    channelId,
    fetchOptions: { cache: 'no-store' },
  });

  const result = data.customer.storedPaymentInstruments.createVaultInitialization;

  if (!result) {
    throw new Error(
      'Failed to create vault initialization: createVaultInitialization resolved to null ' +
        '(no field errors) — check the payment method requires initialization',
    );
  }

  if (result.errors.length > 0) {
    const message = result.errors.map((error) => error.message).join(', ');

    throw new Error(`Failed to create vault initialization: ${message}`);
  }

  return { token: result.token, clientConfiguration: result.clientConfiguration };
}
