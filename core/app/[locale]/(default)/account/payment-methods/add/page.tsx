import { setRequestLocale } from 'next-intl/server';

import { Link } from '~/components/link';

import { AccountPaymentsMicroapp } from './_components/account-payments-microapp';
import { getMicroappAssets, getMicroappCountries, getStripeOcsAchContext } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ provider?: string }>;
}

export default async function AddPaymentMethodPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { provider } = await searchParams;

  setRequestLocale(locale);

  // ?provider=stripeocs-ach renders Stripe ACH through the Payment Element path.
  // Without it, the page keeps rendering the placeholder ECP form.
  const [assets, countries, stripeOcsAch] = await Promise.all([
    getMicroappAssets(),
    getMicroappCountries(),
    provider === 'stripeocs-ach' ? getStripeOcsAchContext() : undefined,
  ]);

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

      <AccountPaymentsMicroapp assets={assets} countries={countries} stripeOcsAch={stripeOcsAch} />
    </div>
  );
}
