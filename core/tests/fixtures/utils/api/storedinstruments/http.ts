import { z } from 'zod';

import { testEnv } from '~/tests/environment';

import { StoredInstrument, StoredInstrumentsApi } from '.';

const ImpersonationTokenSchema = z.object({
  data: z.object({
    token: z.string(),
  }),
});

const StoredInstrumentsSchema = z.object({
  data: z.object({
    customer: z
      .object({
        storedPaymentInstruments: z.object({
          edges: z
            .array(
              z.object({
                node: z.object({
                  token: z.string(),
                  paymentMethodId: z.string(),
                }),
              }),
            )
            .nullable(),
        }),
      })
      .nullable(),
  }),
});

const DeleteResultSchema = z.object({
  data: z.object({
    customer: z.object({
      deleteStoredPaymentInstrument: z
        .object({
          errors: z.array(z.object({ message: z.string() })),
        })
        .nullable(),
    }),
  }),
});

const MAX_PAGE_SIZE = 50;

function requireEnv() {
  const {
    BIGCOMMERCE_ACCESS_TOKEN: accessToken,
    BIGCOMMERCE_STORE_HASH: storeHash,
    BIGCOMMERCE_CHANNEL_ID: channelId,
    BIGCOMMERCE_ADMIN_API_HOST: adminHost,
    BIGCOMMERCE_GRAPHQL_API_DOMAIN: graphqlDomain,
  } = testEnv;

  if (!accessToken || !storeHash || !channelId) {
    throw new Error(
      'BIGCOMMERCE_ACCESS_TOKEN, BIGCOMMERCE_STORE_HASH and BIGCOMMERCE_CHANNEL_ID must be set to manage stored payment instruments',
    );
  }

  return { accessToken, storeHash, channelId, adminHost, graphqlDomain };
}

function canonicalGraphqlUrl(): string {
  const { storeHash, channelId, graphqlDomain } = requireEnv();
  const subdomain = channelId === 1 ? `store-${storeHash}` : `store-${storeHash}-${channelId}`;

  return `https://${subdomain}.${graphqlDomain}/graphql`;
}

let impersonationToken: Promise<string> | undefined;

async function getImpersonationToken(): Promise<string> {
  const { accessToken, storeHash, channelId, adminHost } = requireEnv();

  impersonationToken ??= (async () => {
    const response = await fetch(
      `https://${adminHost}/stores/${storeHash}/v3/storefront/api-token-customer-impersonation`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Auth-Token': accessToken,
        },
        body: JSON.stringify({
          channel_id: channelId,
          expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to create customer impersonation token: ${response.status} ${await response.text()}`,
      );
    }

    return ImpersonationTokenSchema.parse(await response.json()).data.token;
  })();

  return impersonationToken;
}

async function graphqlRequest(
  customerId: number,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<unknown> {
  const token = await getImpersonationToken();

  const response = await fetch(canonicalGraphqlUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Bc-Customer-Id': customerId.toString(),
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(
      `Stored payment instrument request failed: ${response.status} ${await response.text()}`,
    );
  }

  return response.json();
}

const ListQuery = `
  query StoredPaymentInstruments($first: Int!) {
    customer {
      storedPaymentInstruments(first: $first) {
        edges {
          node {
            token
            paymentMethodId
          }
        }
      }
    }
  }
`;

const DeleteMutation = `
  mutation DeleteStoredPaymentInstrument($token: String!) {
    customer {
      deleteStoredPaymentInstrument(input: { token: $token }) {
        errors {
          message
        }
      }
    }
  }
`;

export const storedInstrumentsHttpClient: StoredInstrumentsApi = {
  async list(customerId: number): Promise<StoredInstrument[]> {
    const body = await graphqlRequest(customerId, ListQuery, { first: MAX_PAGE_SIZE });
    const { customer } = StoredInstrumentsSchema.parse(body).data;

    return (customer?.storedPaymentInstruments.edges ?? []).map(({ node }) => node);
  },

  async delete(customerId: number, tokens: string[]): Promise<void> {
    await tokens.reduce(async (previous, token) => {
      await previous;

      const body = await graphqlRequest(customerId, DeleteMutation, { token });
      const result = DeleteResultSchema.parse(body).data.customer.deleteStoredPaymentInstrument;

      if (result && result.errors.length > 0) {
        throw new Error(
          `Failed to delete stored payment instrument: ${result.errors
            .map(({ message }) => message)
            .join(', ')}`,
        );
      }
    }, Promise.resolve());
  },
};
