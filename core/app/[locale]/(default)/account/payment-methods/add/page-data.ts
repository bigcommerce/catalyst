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

// The payment methods this POC can vault, as "<providerId>.<methodId>". The
// microapp's headless context splits this into its providerId and methodType.
export const SUPPORTED_PAYMENT_METHOD_IDS = [
  'stripeocs.card',
  'stripeocs.ach',
  'squarev2.card',
] as const;

export type SupportedPaymentMethodId = (typeof SUPPORTED_PAYMENT_METHOD_IDS)[number];

export const isSupportedPaymentMethodId = (value: unknown): value is SupportedPaymentMethodId =>
  SUPPORTED_PAYMENT_METHOD_IDS.some((id) => id === value);

// Everything the microapp needs to vault one payment method. Fetched per
// request: the provider initialization and the vault access token are both
// single-use.
export interface VaultContext {
  paymentMethodId: SupportedPaymentMethodId;
  // Already in the microapp's field names. Where this mapping should live is
  // still an open question, so the POC keeps it here.
  paymentProviderInitializationData: Record<string, string>;
  vaultAccessToken: string;
  shopperId: string;
  customerEmail: string;
  storeHash: string;
  paymentsUrl: string;
}

const StripeOcsInitializationMutation = graphql(`
  mutation StripeOcsInitializationMutation($paymentMethod: StripeOcsVaultPaymentMethod!) {
    customer {
      storedPaymentInstruments {
        createStripeOcsVaultInitialization(input: { paymentMethod: $paymentMethod }) {
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

const SquareV2InitializationMutation = graphql(`
  mutation SquareV2InitializationMutation {
    customer {
      storedPaymentInstruments {
        createSquareV2VaultInitialization {
          initialization {
            applicationId
            locationId
            environment
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

interface MutationResult<T> {
  initialization?: T | null;
  errors: Array<{ message: string }>;
}

function unwrap<T>(paymentMethodId: string, result: MutationResult<T> | null | undefined): T {
  if (!result?.initialization) {
    const messages = (result?.errors ?? []).map((error) => error.message);

    throw new Error(
      `Vault initialization for ${paymentMethodId} failed: ${messages.join('; ') || 'no data'}`,
    );
  }

  return result.initialization;
}

// Calls the provider's own initialization mutation and maps the result to the
// field names the microapp reads.
async function getInitializationData(
  paymentMethodId: SupportedPaymentMethodId,
  customerAccessToken: string | undefined,
): Promise<Record<string, string>> {
  if (paymentMethodId === 'squarev2.card') {
    const squareResponse = await client.fetch({
      document: SquareV2InitializationMutation,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });
    const { applicationId, locationId, environment } = unwrap(
      paymentMethodId,
      squareResponse.data.customer.storedPaymentInstruments.createSquareV2VaultInitialization,
    );

    return {
      applicationId,
      locationId,
      // The microapp loads Square's sandbox SDK only when env is 'staging'.
      env: environment === 'SANDBOX' ? 'staging' : 'production',
    };
  }

  const response = await client.fetch({
    document: StripeOcsInitializationMutation,
    variables: { paymentMethod: paymentMethodId === 'stripeocs.ach' ? 'ACH' : 'CARD' },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });
  const { setupIntentClientSecret, publishableKey, connectedAccountId } = unwrap(
    paymentMethodId,
    response.data.customer.storedPaymentInstruments.createStripeOcsVaultInitialization,
  );

  return {
    // A setupIntentToken sends the microapp down its Stripe Payment Element
    // path, for both card and ACH.
    setupIntentToken: setupIntentClientSecret,
    stripePublishableKey: publishableKey,
    ...(connectedAccountId && { stripeConnectedAccount: connectedAccountId }),
  };
}

export async function getVaultContext(
  paymentMethodId: SupportedPaymentMethodId,
): Promise<VaultContext> {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const [paymentProviderInitializationData, tokenResponse, customerResponse] = await Promise.all([
    getInitializationData(paymentMethodId, customerAccessToken),
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

  const tokenResult = tokenResponse.data.customer.storedPaymentInstruments.createVaultAccessToken;
  const vaultAccessToken = tokenResult?.vaultAccessToken;
  const customer = customerResponse.data.customer;

  if (!vaultAccessToken || !customer) {
    const messages = (tokenResult?.errors ?? []).map((error) => error.message);

    throw new Error(`Vault access token creation failed: ${messages.join('; ') || 'no data'}`);
  }

  return {
    paymentMethodId,
    paymentProviderInitializationData,
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
