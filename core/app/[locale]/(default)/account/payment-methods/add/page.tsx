import { setRequestLocale } from 'next-intl/server';

import { Link } from '~/components/link';

import { AccountPaymentsMicroapp } from './_components/account-payments-microapp';
import { getMicroappAssets, getMicroappCountries } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AddPaymentMethodPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const [assets, countries] = await Promise.all([getMicroappAssets(), getMicroappCountries()]);

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

      <AccountPaymentsMicroapp assets={assets} countries={countries} />
    </div>
  );
}
