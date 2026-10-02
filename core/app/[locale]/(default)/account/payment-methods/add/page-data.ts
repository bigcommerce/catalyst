import { cache } from 'react';
import { z } from 'zod';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

// Where to load the microapp bundle from. Defaults to the prod CDN.
// Override with ACCOUNT_PAYMENTS_MICROAPP_BASE in .env.local, for example a
// local build served over a CORS-enabled static server:
//   ACCOUNT_PAYMENTS_MICROAPP_BASE=http://localhost:4000/
// or the integration CDN:
//   ACCOUNT_PAYMENTS_MICROAPP_BASE=https://microapps.integration.zone/storefront-account-payments/
const MICROAPP_BASE =
  process.env.ACCOUNT_PAYMENTS_MICROAPP_BASE ??
  'https://microapps.bigcommerce.com/storefront-account-payments/';

export interface MicroappAssets {
  base: string;
  js: string[];
  css: string[];
  error?: string;
}

const ManifestSchema = z.object({
  js: z.array(z.string()).optional(),
  css: z.array(z.string()).optional(),
});

export async function getMicroappAssets(): Promise<MicroappAssets> {
  try {
    const res = await fetch(new URL('manifest.json', MICROAPP_BASE), { cache: 'no-store' });

    if (!res.ok) {
      return { base: MICROAPP_BASE, js: [], css: [], error: `manifest HTTP ${res.status}` };
    }

    const manifest = ManifestSchema.parse(await res.json());

    return { base: MICROAPP_BASE, js: manifest.js ?? [], css: manifest.css ?? [] };
  } catch (error) {
    return { base: MICROAPP_BASE, js: [], css: [], error: String(error) };
  }
}

// The shapes the microapp expects for its billing-address country/state selectors.
export interface MicroappState {
  code: string;
  name: string;
  value: string;
}

export interface MicroappCountry {
  code: string;
  value: string;
  label: string;
  states?: MicroappState[];
}

const GetCountriesQuery = graphql(`
  query GetCountriesQuery {
    geography {
      countries {
        code
        name
        statesOrProvinces {
          name
          abbreviation
        }
      }
    }
  }
`);

// Everything the microapp needs to vault a Stripe ACH account through the
// Payment Element path. Fetched per request: the SetupIntent and the vault
// access token are both single-use.
export interface StripeOcsAchContext {
  setupIntentClientSecret: string;
  publishableKey: string;
  connectedAccountId: string | null;
  vaultAccessToken: string;
  shopperId: string;
  customerEmail: string;
  storeHash: string;
  paymentsUrl: string;
}

const StripeOcsAchInitializationMutation = graphql(`
  mutation StripeOcsAchInitializationMutation {
    customer {
      storedPaymentInstruments {
        createStripeOcsVaultInitialization(input: { paymentMethod: ACH }) {
          initialization {
            setupIntentClientSecret
            publishableKey
            connectedAccountId
          }
          errors {
            message
          }
        }
      }
    }
  }
`);

// A separate request: Storefront costs each of these mutations as a
// UniqueMutation, and the two together exceed the query complexity limit.
const VaultAccessTokenMutation = graphql(`
  mutation VaultAccessTokenMutation {
    customer {
      storedPaymentInstruments {
        createVaultAccessToken {
          vaultAccessToken
          errors {
            message
          }
        }
      }
    }
  }
`);

const CurrentCustomerQuery = graphql(`
  query CurrentCustomerQuery {
    customer {
      entityId
      email
    }
  }
`);

export async function getStripeOcsAchContext(): Promise<StripeOcsAchContext> {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const [initResponse, tokenResponse, customerResponse] = await Promise.all([
    client.fetch({
      document: StripeOcsAchInitializationMutation,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    }),
    client.fetch({
      document: VaultAccessTokenMutation,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    }),
    client.fetch({
      document: CurrentCustomerQuery,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    }),
  ]);

  const initResult =
    initResponse.data.customer.storedPaymentInstruments.createStripeOcsVaultInitialization;
  const tokenResult = tokenResponse.data.customer.storedPaymentInstruments.createVaultAccessToken;
  const initialization = initResult?.initialization;
  const vaultAccessToken = tokenResult?.vaultAccessToken;
  const customer = customerResponse.data.customer;

  if (!initialization || !vaultAccessToken || !customer) {
    const messages = [...(initResult?.errors ?? []), ...(tokenResult?.errors ?? [])].map(
      (error) => error.message,
    );

    throw new Error(`Stripe ACH initialization failed: ${messages.join('; ') || 'no data'}`);
  }

  return {
    ...initialization,
    // BigPay reads the token from "Authorization: VAT <token>", and the microapp
    // sends vaultToken verbatim, so the scheme must be part of the value.
    vaultAccessToken: vaultAccessToken.startsWith('VAT ')
      ? vaultAccessToken
      : `VAT ${vaultAccessToken}`,
    shopperId: String(customer.entityId),
    customerEmail: customer.email,
    storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
    paymentsUrl: process.env.PAYMENTS_HOST ?? '',
  };
}

export const getMicroappCountries = cache(async (): Promise<MicroappCountry[]> => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: GetCountriesQuery,
    customerAccessToken,
    fetchOptions: { next: { revalidate: 3600 } },
  });

  return (response.data.geography.countries ?? []).map((country) => {
    const states = country.statesOrProvinces.map((state) => ({
      code: state.abbreviation,
      name: state.name,
      value: state.abbreviation,
    }));

    return {
      code: country.code,
      value: country.code,
      label: country.name,
      // Omit when empty so the microapp renders a free-text field, not an empty dropdown.
      ...(states.length > 0 && { states }),
    };
  });
});
