import type { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { GiftCertificatesSection } from '@/vibes/soul/sections/gift-certificates-section';
import { redirect } from '~/i18n/routing';
import { getPreferredCurrencyCode } from '~/lib/currency';

import { getGiftCertificatesData } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'GiftCertificates' });

  return {
    title: t('title') || 'Gift certificates',
  };
}

export default async function GiftCertificates(props: Props) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  const t = await getTranslations('GiftCertificates');
  const format = await getFormatter();
  const currencyCode = await getPreferredCurrencyCode();
  const data = await getGiftCertificatesData(currencyCode);

  if (!data.giftCertificatesEnabled) {
    return redirect({ href: '/', locale });
  }

  const exampleBalance = format.number(25.0, {
    style: 'currency',
    currency: currencyCode ?? data.defaultCurrency,
  });

  return (
    <GiftCertificatesSection
      checkBalanceHref="/gift-certificates/balance"
      checkBalanceLabel={t('checkBalanceLabel')}
      description={t('description')}
      exampleBalance={exampleBalance}
      logo={data.logo}
      purchaseHref="/gift-certificates/purchase"
      purchaseLabel={t('purchaseLabel')}
      title={t('title')}
    />
  );
}
