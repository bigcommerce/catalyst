import { getLocale } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { toAccountPaymentsMicroappCountries } from '~/data-transformers/account-payments-countries';
import { getPreferredCurrencyCode } from '~/lib/currency';

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
      settings {
        url {
          paymentBaseUrl
        }
      }
      currencies {
        edges {
          node {
            code
            isDefault
          }
        }
      }
      storedInstrumentsManifest {
        appVersion
        scripts {
          src
          integrity
        }
      }
    }
  }
`);

export async function getAddPaymentPageData({ paymentMethodId }: { paymentMethodId: string }) {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const [{ data }, storeLocale, preferredCurrencyCode] = await Promise.all([
    client.fetch({
      document: AddPaymentPageDataQuery,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    }),
    getLocale(),
    getPreferredCurrencyCode(),
  ]);

  const { storedInstrumentsManifest: manifest, settings } = data.site;

  if (!manifest) {
    throw new Error('Account payments microapp manifest is not available');
  }

  const paymentsUrl = settings?.url.paymentBaseUrl;

  if (!paymentsUrl) {
    throw new Error('No payment base url resolved for this session');
  }

  const defaultCurrencyCode = data.site.currencies.edges?.find(({ node }) => node.isDefault)?.node
    .code;
  const currencyCode = preferredCurrencyCode ?? defaultCurrencyCode;

  if (!currencyCode) {
    throw new Error('No currency code resolved for this session');
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
    paymentsUrl,
    // The URL of shopper's stored payment methods page
    paymentMethodsUrl: '/account/payment-methods',
    storefrontApiBaseUrl,
    shopperId: customer.entityId.toString(),
    customerEmail: customer.email,
    countries: toAccountPaymentsMicroappCountries(data.geography.countries ?? []),
    storeLocale,
    currencyCode,
    paymentMethodId,
  };

  return { storeContextData, manifest };
}
