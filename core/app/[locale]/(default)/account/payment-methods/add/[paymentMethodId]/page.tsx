import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AccountPaymentsMicroapp } from './_components/account-payments-microapp';
import { getAddPaymentPageData } from './page-data';

interface Props {
  params: Promise<{ locale: string; paymentMethodId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Account.PaymentMethods.Add' });

  return {
    title: t('title'),
  };
}

export default async function AddPaymentMethod({ params }: Props) {
  const { locale, paymentMethodId } = await params;

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Account.PaymentMethods.Add' });

  const { storeContextData, manifest } = await getAddPaymentPageData({
    paymentMethodId,
  });

  return (
    <>
      <header className="mb-4 border-[var(--account-payments-add-section-border,hsl(var(--contrast-100)))] @2xl:min-h-[72px] @2xl:border-b">
        <h1 className="hidden font-[family-name:var(--account-payments-add-section-title-font-family,var(--font-family-heading))] text-4xl font-medium leading-none tracking-tight text-[var(--account-payments-add-section-title,hsl(var(--foreground)))] @2xl:block">
          {t('title')}
        </h1>
      </header>
      <div id="bc-account-payments" />
      <AccountPaymentsMicroapp manifest={manifest} storeContextData={storeContextData} />
    </>
  );
}
