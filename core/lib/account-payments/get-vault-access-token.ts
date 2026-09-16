import 'server-only';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const CreateVaultAccessTokenMutation = graphql(`
  mutation CreateVaultAccessToken {
    customer {
      storedPaymentInstruments {
        createVaultAccessToken {
          vaultAccessToken
          expiresAt
          errors {
            message
          }
        }
      }
    }
  }
`);

export async function getVaultAccessToken(channelId?: string) {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const { data } = await client.fetch({
    document: CreateVaultAccessTokenMutation,
    customerAccessToken,
    channelId,
    fetchOptions: { cache: 'no-store' },
  });
  // Note: `Mutation.customer` is non-null, so no null-check is needed here.
  const result = data.customer.storedPaymentInstruments.createVaultAccessToken;

  if (!result) {
    throw new Error(
      'Failed to create vault access token: createVaultAccessToken resolved to null ' +
        '(no field errors) — check the store/channel is configured for payment vaulting',
    );
  }

  if (result.errors.length > 0) {
    const message = result.errors.map((error) => error.message).join(', ');

    throw new Error(`Failed to create vault access token: ${message}`);
  }

  if (!result.vaultAccessToken) {
    throw new Error('Failed to create vault access token: no token returned');
  }

  return { vaultToken: result.vaultAccessToken, expiresAt: result.expiresAt };
}
