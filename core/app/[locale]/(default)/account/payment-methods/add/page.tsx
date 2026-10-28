import { setRequestLocale } from 'next-intl/server';

import { Link } from '~/components/link';
import { getPreferredCurrencyCode } from '~/lib/currency';

import { AccountPaymentsMicroapp } from './_components/account-payments-microapp';
import {
  getCustomerForVault,
  getMicroappAssets,
  getMicroappCountries,
  getVaultContext,
} from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ provider?: string; method_type?: string }>;
}

export default async function AddPaymentMethodPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { provider, method_type: methodType } = await searchParams;

  setRequestLocale(locale);

  const [assets, countries] = await Promise.all([getMicroappAssets(), getMicroappCountries()]);

  const isStripeCard = provider === 'stripeocs' && methodType === 'card';

  let storeContextData: Record<string, unknown>;

  if (isStripeCard) {
    // Currency selects the merchant's provider profile (not an amount), mirroring how the Stencil vault init passes it.
    const currencyCode = (await getPreferredCurrencyCode()) ?? 'USD';
    const [vaultContext, customer] = await Promise.all([
      getVaultContext('stripeocs', currencyCode),
      getCustomerForVault(),
    ]);

    storeContextData = {
      providerId: 'stripeocs',
      methodType: 'card',
      storeLocale: locale,
      countries,
      // Same-origin proxy so the browser -> BigPay submit stays a first-party request (no CORS) and keeps the VAT off
      // any third-party origin.
      paymentsUrl: '/api/payments-proxy',
      paymentMethodsUrl: '/account/payment-methods',
      // The microapp sends this verbatim as the Authorization header. BigPay's GenerateVaultToken already returns the
      // token with its "VAT " scheme prefix, so pass it through as-is; adding another prefix double-prefixes it.
      vaultToken: vaultContext.vaultToken,
      shopperId: String(customer?.entityId ?? ''),
      storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
      currencyCode,
      customerEmail: customer?.email ?? '',
      paymentProviderInitializationData: {
        stripePublishableKey: vaultContext.init.publishableKey,
        setupIntentToken: vaultContext.init.setupIntentClientSecret,
        ...(vaultContext.init.connectedAccount
          ? { stripeConnectedAccount: vaultContext.init.connectedAccount }
          : {}),
      },
    };
  } else {
    // ECP (ACH) render POC: routes to the plain bank-account form, which needs no init data.
    storeContextData = {
      providerId: 'test',
      methodType: 'ecp',
      storeLocale: locale,
      countries,
      paymentsUrl: '',
      paymentMethodsUrl: '/account/payment-methods',
      vaultToken: '',
      shopperId: '',
      storeHash: '',
      currencyCode: 'USD',
      customerEmail: '',
      paymentProviderInitializationData: {},
    };
  }

  return (
    <div>
      <Link
        className="mb-6 inline-block text-sm text-[hsl(var(--contrast-500))] hover:text-[hsl(var(--foreground))]"
        href="/account/payment-methods/"
      >
        Back to payment methods
      </Link>

      <h1 className="mb-8 font-[family-name:var(--font-family-heading)] text-4xl font-medium leading-none tracking-tight">
        Add payment method
      </h1>

      <AccountPaymentsMicroapp assets={assets} storeContextData={storeContextData} />
    </div>
  );
}
