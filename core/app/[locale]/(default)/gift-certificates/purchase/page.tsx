import { ResultOf } from 'gql.tada';
import { getFormatter, getTranslations } from 'next-intl/server';

import { Field, FieldGroup } from '@/vibes/soul/form/dynamic-form/schema';
import { GiftCertificatePurchaseSection } from '@/vibes/soul/sections/gift-certificate-purchase-section';
import { GiftCertificateSettingsFragment } from '~/app/[locale]/(default)/gift-certificates/purchase/fragment';
import { ExistingResultType } from '~/client/util';
import { redirect } from '~/i18n/routing';
import { getPreferredCurrencyCode } from '~/lib/currency';

import { addGiftCertificateToCart } from './_actions/add-to-cart';
import { getGiftCertificatePurchaseData } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
}

function getFields(
  giftCertificateSettings: ResultOf<typeof GiftCertificateSettingsFragment>,
  expiresAt: string | undefined,
  t: ExistingResultType<typeof getTranslations>,
): Array<Field | FieldGroup<Field>> {
  const baseFields: Array<Field | FieldGroup<Field>> = [
    [
      {
        type: 'text',
        name: 'senderName',
        label: `${t('Purchase.Form.senderNameLabel')} *`,
        required: true,
      },
      {
        type: 'email',
        name: 'senderEmail',
        label: `${t('Purchase.Form.senderEmailLabel')} *`,
        required: true,
      },
    ],
    [
      {
        type: 'text',
        name: 'recipientName',
        label: `${t('Purchase.Form.recipientNameLabel')} *`,
        required: true,
      },
      {
        type: 'email',
        name: 'recipientEmail',
        label: `${t('Purchase.Form.recipientEmailLabel')} *`,
        required: true,
      },
    ],
    {
      type: 'textarea',
      name: 'message',
      label: t('Purchase.Form.messageLabel'),
      required: false,
    },
    {
      type: 'checkbox',
      name: 'nonRefundable',
      label: t('Purchase.Form.nonRefundableCheckboxLabel'),
      required: true,
    },
  ];

  if (expiresAt) {
    baseFields.push({
      type: 'checkbox',
      name: 'expirationConsent',
      label: t('Purchase.Form.expiryCheckboxLabel', { expiryDate: expiresAt }),
      required: true,
    });
  }

  const amountFields: Array<Field | FieldGroup<Field>> =
    giftCertificateSettings.__typename === 'CustomAmountGiftCertificateSettings'
      ? [
          {
            type: 'text',
            name: 'amount',
            label: `${t('Purchase.Form.customAmountLabel', {
              minAmount: String(giftCertificateSettings.minimumAmount.value),
              maxAmount: String(giftCertificateSettings.maximumAmount.value),
            })} *`,
            pattern: '^[0-9]*\\.?[0-9]+$',
            required: true,
          },
        ]
      : [
          {
            type: 'select',
            name: 'amount',
            label: `${t('Purchase.Form.amountLabel')} *`,
            defaultValue: '0',
            options: [
              {
                label: t('Purchase.Form.selectAmountPlaceholder'),
                value: '0',
              },
              ...giftCertificateSettings.amounts.map((amount) => ({
                label: amount.formattedV2 ?? '',
                value: String(amount.value),
              })),
            ],
            required: true,
          },
        ];

  return [...amountFields, ...baseFields];
}

function getExpiryDate(
  expiry: ResultOf<typeof GiftCertificateSettingsFragment>['expiry'],
): number | undefined {
  if (!expiry?.unit || !expiry.value) {
    return undefined;
  }

  switch (expiry.unit) {
    case 'DAYS':
      return Date.now() + expiry.value * 24 * 60 * 60 * 1000;

    case 'WEEKS':
      return Date.now() + expiry.value * 7 * 24 * 60 * 60 * 1000;

    case 'MONTHS':
      return Date.now() + expiry.value * 30 * 24 * 60 * 60 * 1000;

    case 'YEARS':
      return Date.now() + expiry.value * 365 * 24 * 60 * 60 * 1000;

    default:
      return undefined;
  }
}

export default async function GiftCertificatePurchasePage({ params }: Props) {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'GiftCertificates' });
  const format = await getFormatter();
  const currencyCode = await getPreferredCurrencyCode();
  const data = await getGiftCertificatePurchaseData(currencyCode);

  if (!data.giftCertificateSettings?.isEnabled) {
    return redirect({ href: '/', locale });
  }

  const expiryDate = getExpiryDate(data.giftCertificateSettings.expiry);
  const expiresAt = expiryDate ? format.dateTime(expiryDate, { dateStyle: 'long' }) : undefined;
  const fields = getFields(data.giftCertificateSettings, expiresAt, t);

  return (
    <GiftCertificatePurchaseSection
      action={addGiftCertificateToCart}
      breadcrumbs={[
        { label: t('title'), href: '/gift-certificates' },
        { label: t('Purchase.breadcrumbTitle'), href: '#' },
      ]}
      ctaLabel={t('Purchase.Form.ctaLabel')}
      currencyCode={currencyCode ?? data.defaultCurrency}
      description={t('Purchase.description')}
      expiresAt={expiresAt}
      expiresAtLabel={t('expiresAtLabel')}
      formFields={fields}
      logo={data.logo}
      settings={{
        minCustomAmount:
          'minimumAmount' in data.giftCertificateSettings
            ? data.giftCertificateSettings.minimumAmount.value
            : undefined,
        maxCustomAmount:
          'maximumAmount' in data.giftCertificateSettings
            ? data.giftCertificateSettings.maximumAmount.value
            : undefined,
      }}
      subtitle={data.storeName}
      title={t('Purchase.title')}
    />
  );
}
