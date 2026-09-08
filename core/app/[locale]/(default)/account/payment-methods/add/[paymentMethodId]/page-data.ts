import { getLocale } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { toAccountPaymentsMicroappCountries } from '~/data-transformers/account-payments-countries';
import { getMicroappManifest } from '~/lib/account-payments/manifest';
import { getVaultInitialization } from '~/lib/account-payments/vault-initialization';
import { getPreferredCurrencyCode } from '~/lib/currency';

// This will be replaced with `site.settings.payments.origin` GQL field once available
const PAYMENTS_URL = 'https://bigpay.service.bcdev';

const AddPaymentPageDataQuery = graphql(`
  query AddPaymentPageDataQuery {
    customer {
      entityId
      email
    }
    geography {
      countries {
        code
        name
        statesOrProvinces {
          abbreviation
          name
        }
      }
    }
    site {
      currencies {
        edges {
          node {
            code
            isDefault
          }
        }
      }
    }
  }
`);

export async function getAddPaymentPageData({
  paymentMethodId,
  isInitDataRequired,
}: {
  paymentMethodId: string;
  isInitDataRequired: boolean;
}) {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const [{ data }, manifest, storeLocale, preferredCurrencyCode] = await Promise.all([
    client.fetch({
      document: AddPaymentPageDataQuery,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    }),
    getMicroappManifest(),
    getLocale(),
    getPreferredCurrencyCode(),
  ]);

  const defaultCurrencyCode = data.site.currencies.edges?.find(({ node }) => node.isDefault)?.node
    .code;
  const currencyCode = preferredCurrencyCode ?? defaultCurrencyCode;

  if (!currencyCode) {
    throw new Error('No currency code resolved for this session');
  }

  let providerInitialization: unknown;

  if (isInitDataRequired) {
    ({ providerInitialization } = await getVaultInitialization(paymentMethodId, currencyCode));
  }

  const customer = data.customer;

  if (!customer) {
    throw new Error('no authenticated customer');
  }

  const storeHash = process.env.BIGCOMMERCE_STORE_HASH;

  if (!storeHash) {
    throw new Error('BIGCOMMERCE_STORE_HASH is not configured');
  }

  const channelId = getChannelIdFromLocale(storeLocale);

  if (!channelId) {
    throw new Error('No channel id resolved for this session');
  }

  const storefrontApiBaseUrl = await client.getCanonicalUrl(channelId);

  // vaultToken prop is intentionally omitted here
  // It's a secret delivered separately via GET /api/account/vault-token
  const storeContextData = {
    storeHash,
    paymentsUrl: PAYMENTS_URL,
    paymentMethodsUrl: '/account/payment-methods',
    storefrontApiBaseUrl,
    shopperId: customer.entityId.toString(),
    customerEmail: customer.email,
    countries: toAccountPaymentsMicroappCountries(data.geography.countries ?? []),
    storeLocale,
    currencyCode,
    paymentMethodId,
    paymentProviderInitializationData: providerInitialization,
  };

  return { storeContextData, manifest };
}
