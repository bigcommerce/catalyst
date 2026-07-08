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

export const getMicroappCountries = cache(async (): Promise<MicroappCountry[]> => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: GetCountriesQuery,
    customerAccessToken,
    fetchOptions: { next: { revalidate: 3600 } },
  });

  return response.data.geography.countries.map((country) => {
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

// --- Stripe OCS card vaulting (PROJECT-6074) ---

export interface StripeOcsVaultInit {
  publishableKey: string;
  setupIntentClientSecret: string;
  connectedAccount?: string | null;
}

export interface VaultContext {
  vaultToken: string;
  init: StripeOcsVaultInit;
}

// Mints the VAT and the provider vault initialization in one round-trip. The two are separate operations (a credential
// vs the SDK render data) but ride the same request. The VAT and setup token only ever reach the browser inside the
// microapp's storeContextData at render.
const AddCardVaultContextMutation = graphql(`
  mutation AddCardVaultContext($providerId: ID!, $currencyCode: String!) {
    payment {
      storedInstrument {
        createVaultToken {
          vaultToken
          expiresIn
        }
        createVaultInitialization(providerId: $providerId, currencyCode: $currencyCode) {
          data {
            __typename
            ... on StripeOcsVaultInit {
              publishableKey
              setupIntentClientSecret
              connectedAccount
            }
          }
        }
      }
    }
  }
`);

export const getVaultContext = cache(
  async (providerId: string, currencyCode: string): Promise<VaultContext> => {
    const customerAccessToken = await getSessionCustomerAccessToken();

    const response = await client.fetch({
      document: AddCardVaultContextMutation,
      variables: { providerId, currencyCode },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    const storedInstrument = response.data.payment.storedInstrument;
    const vaultToken = storedInstrument.createVaultToken?.vaultToken;
    const init = storedInstrument.createVaultInitialization?.data;

    if (!vaultToken) {
      throw new Error('createVaultToken returned no vault token');
    }

    // The union arm the storefront returned must be one we know how to render; otherwise fail rather than guess.
    if (init?.__typename !== 'StripeOcsVaultInit') {
      throw new Error(`Unsupported vault initialization provider: ${init?.__typename ?? 'none'}`);
    }

    return {
      vaultToken,
      init: {
        publishableKey: init.publishableKey,
        setupIntentClientSecret: init.setupIntentClientSecret,
        connectedAccount: init.connectedAccount,
      },
    };
  },
);

export interface CustomerVaultInfo {
  entityId: number;
  email: string;
}

const GetCustomerForVaultQuery = graphql(`
  query GetCustomerForVault {
    customer {
      entityId
      email
    }
  }
`);

export const getCustomerForVault = cache(async (): Promise<CustomerVaultInfo | null> => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: GetCustomerForVaultQuery,
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  const customer = response.data.customer;

  return customer ? { entityId: customer.entityId, email: customer.email } : null;
});
