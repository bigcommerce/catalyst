import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { GiftCertificateCheckBalanceSection } from '@/vibes/soul/sections/gift-certificate-balance-section';
import { redirect } from '~/i18n/routing';
import { getPreferredCurrencyCode } from '~/lib/currency';

import { getGiftCertificatesData } from '../page-data';

import { getGiftCertificateByCode } from './_actions/get-gift-certificate-by-code';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'GiftCertificates' });

  return {
    title: t('title') || 'Gift certificates - Check balance',
  };
}

export default async function GiftCertificates(props: Props) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  const t = await getTranslations('GiftCertificates');
  const currencyCode = await getPreferredCurrencyCode();
  const data = await getGiftCertificatesData(currencyCode);

  if (!data.giftCertificatesEnabled) {
    return redirect({ href: '/', locale });
  }

  return (
    <GiftCertificateCheckBalanceSection
      action={getGiftCertificateByCode}
      breadcrumbs={[
        {
          label: t('title'),
          href: '/gift-certificates',
        },
        {
          label: t('CheckBalance.title'),
          href: '#',
        },
      ]}
      checkBalanceLabel={t('checkBalanceLabel')}
      description={t('CheckBalance.description')}
      expiresAtLabel={t('expiresAtLabel')}
      inputLabel={t('CheckBalance.inputLabel')}
      inputPlaceholder={t('CheckBalance.inputPlaceholder')}
      logo={data.logo}
      purchasedDateLabel={t('CheckBalance.purchasedDateLabel')}
      senderLabel={t('CheckBalance.senderLabel')}
      title={t('CheckBalance.title')}
    />
  );
}
