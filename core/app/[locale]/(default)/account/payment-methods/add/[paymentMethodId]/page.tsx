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

  const { storeContextData, manifest } = await getAddPaymentPageData({
    paymentMethodId,
  });

  return (
    <>
      <div id="bc-account-payments" />
      <AccountPaymentsMicroapp manifest={manifest} storeContextData={storeContextData} />
    </>
  );
}
